import { CircuitsWasm, MAX_NEW_COMMITMENTS_PER_TX, MAX_NEW_NULLIFIERS_PER_TX } from '@aztec/circuits.js';
import { computeCommitmentNonce, siloNullifier } from '@aztec/circuits.js/abis';
import { Grumpkin } from '@aztec/circuits.js/barretenberg';
import { Fr } from '@aztec/foundation/fields';
import { createDebugLogger } from '@aztec/foundation/log';
import { AztecNode, KeyStore, L2BlockContext, L2BlockL2Logs, NoteSpendingInfo, PublicKey } from '@aztec/types';

import { Database, NoteSpendingInfoDao } from '../database/index.js';
import { getAcirSimulator } from '../simulator/index.js';

/**
 * Contains all the decrypted data in this array so that we can later batch insert it all into the database.
 */
interface ProcessedData {
  /**
   * Holds L2 block data and associated context.
   */
  blockContext: L2BlockContext;
  /**
   * A collection of data access objects for note spending info.
   */
  noteSpendingInfoDaos: NoteSpendingInfoDao[];
}

/**
 * NoteProcessor is responsible for decrypting logs and converting them to notes via their originating contracts
 * before storing them against their owner.
 */
export class NoteProcessor {
  /**
   * The latest L2 block number that the note processor has synchronized to.
   */
  private syncedToBlock = 0;

  constructor(
    /**
     * The public counterpart to the private key to be used in note decryption.
     */
    public readonly publicKey: PublicKey,
    private keyStore: KeyStore,
    private db: Database,
    private node: AztecNode,
    private simulator = getAcirSimulator(db, node, node, node, keyStore),
    private log = createDebugLogger('aztec:aztec_note_processor'),
  ) {}

  /**
   * Check if the NoteProcessor is synchronised with the remote block number.
   * The function queries the remote block number from the AztecNode and compares it with the syncedToBlock value in the NoteProcessor.
   * If the values are equal, then the NoteProcessor is considered to be synchronised, otherwise not.
   *
   * @returns A boolean indicating whether the NoteProcessor is synchronised with the remote block number or not.
   */
  public async isSynchronised() {
    const remoteBlockNumber = await this.node.getBlockNumber();
    return this.syncedToBlock === remoteBlockNumber;
  }

  /**
   * Returns synchronisation status (ie up to which block has been synced ) for this note processor.
   */
  public get status() {
    return { syncedToBlock: this.syncedToBlock };
  }

  /**
   * Process the given L2 block contexts and encrypted logs to update the note processor.
   * It synchronizes the user's account by decrypting the encrypted logs and processing
   * the transactions and auxiliary data associated with them.
   * Throws an error if the number of block contexts and encrypted logs do not match.
   *
   * @param l2BlockContexts - An array of L2 block contexts to be processed.
   * @param encryptedL2BlockLogs - An array of encrypted logs associated with the L2 block contexts.
   * @returns A promise that resolves once the processing is completed.
   */
  public async process(l2BlockContexts: L2BlockContext[], encryptedL2BlockLogs: L2BlockL2Logs[]): Promise<void> {
    if (l2BlockContexts.length !== encryptedL2BlockLogs.length) {
      throw new Error(
        `Number of blocks and EncryptedLogs is not equal. Received ${l2BlockContexts.length} blocks, ${encryptedL2BlockLogs.length} encrypted logs.`,
      );
    }
    if (!l2BlockContexts.length) {
      return;
    }

    const blocksAndNoteSpendingInfo: ProcessedData[] = [];
    const curve = await Grumpkin.new();

    // Iterate over both blocks and encrypted logs.
    for (let blockIndex = 0; blockIndex < encryptedL2BlockLogs.length; ++blockIndex) {
      const { txLogs } = encryptedL2BlockLogs[blockIndex];
      const block = l2BlockContexts[blockIndex].block;
      const dataStartIndexForBlock = block.startPrivateDataTreeSnapshot.nextAvailableLeafIndex;

      // We are using set for `userPertainingTxIndices` to avoid duplicates. This would happen in case there were
      // multiple encrypted logs in a tx pertaining to a user.
      const noteSpendingInfoDaos: NoteSpendingInfoDao[] = [];
      const privateKey = await this.keyStore.getAccountPrivateKey(this.publicKey);

      // Iterate over all the encrypted logs and try decrypting them. If successful, store the note spending info.
      for (let indexOfTxInABlock = 0; indexOfTxInABlock < txLogs.length; ++indexOfTxInABlock) {
        const dataStartIndexForTx = dataStartIndexForBlock + indexOfTxInABlock * MAX_NEW_COMMITMENTS_PER_TX;
        const newCommitments = block.newCommitments.slice(
          indexOfTxInABlock * MAX_NEW_COMMITMENTS_PER_TX,
          (indexOfTxInABlock + 1) * MAX_NEW_COMMITMENTS_PER_TX,
        );
        const newNullifiers = block.newNullifiers.slice(
          indexOfTxInABlock * MAX_NEW_NULLIFIERS_PER_TX,
          (indexOfTxInABlock + 1) * MAX_NEW_NULLIFIERS_PER_TX,
        );
        // Note: Each tx generates a `TxL2Logs` object and for this reason we can rely on its index corresponding
        //       to the index of a tx in a block.
        const txFunctionLogs = txLogs[indexOfTxInABlock].functionLogs;
        for (const functionLogs of txFunctionLogs) {
          for (const logs of functionLogs.logs) {
            const noteSpendingInfo = NoteSpendingInfo.fromEncryptedBuffer(logs, privateKey, curve);
            if (noteSpendingInfo) {
              // We have successfully decrypted the data.
              try {
                const { index, nonce, siloedNullifier } = await this.findNoteIndexAndNullifier(
                  dataStartIndexForTx,
                  newCommitments,
                  newNullifiers[0],
                  noteSpendingInfo,
                );
                noteSpendingInfoDaos.push({
                  ...noteSpendingInfo,
                  nonce,
                  siloedNullifier,
                  index,
                  publicKey: this.publicKey,
                });
              } catch (e) {
                this.log.warn(`Could not process note because of "${e}". Skipping note...`);
              }
            }
          }
        }
      }

      blocksAndNoteSpendingInfo.push({
        blockContext: l2BlockContexts[blockIndex],
        noteSpendingInfoDaos,
      });
    }

    await this.processBlocksAndNoteSpendingInfo(blocksAndNoteSpendingInfo);

    this.syncedToBlock = l2BlockContexts[l2BlockContexts.length - 1].block.number;
    this.log(`Synched block ${this.syncedToBlock}`);
  }

  /**
   * Find the index of the note in the private data tree by computing the note hash with different nonce and see which
   * commitment for the current tx matches this value.
   * Compute the nullifier for a given transaction auxiliary data.
   * The nullifier is calculated using the private key of the account,
   * contract address, and note preimage associated with the noteSpendingInfo.
   * This method assists in identifying spent commitments in the private state.
   * @param dataStartIndex - First index of the commitments in the tx in the private data tree.
   * @param commitments - Commitments in the tx. One of them should be the note's commitment.
   * @param firstNullifier - First nullifier in the tx.
   * @param noteSpendingInfo - An instance of NoteSpendingInfo containing transaction details.
   * @returns A Fr instance representing the computed nullifier.
   */
  private async findNoteIndexAndNullifier(
    dataStartIndex: number,
    commitments: Fr[],
    firstNullifier: Fr,
    { contractAddress, storageSlot, notePreimage }: NoteSpendingInfo,
  ) {
    const wasm = await CircuitsWasm.get();
    let commitmentIndex = 0;
    let nonce: Fr | undefined;
    let innerNoteHash: Fr | undefined;
    let siloedNoteHash: Fr | undefined;
    let uniqueSiloedNoteHash: Fr | undefined;
    let innerNullifier: Fr | undefined;
    for (; commitmentIndex < commitments.length; ++commitmentIndex) {
      const commitment = commitments[commitmentIndex];
      if (commitment.equals(Fr.ZERO)) break;

      const expectedNonce = computeCommitmentNonce(wasm, firstNullifier, commitmentIndex);
      const {
        innerNoteHash: innerNoteHashTmp,
        siloedNoteHash: siloedNoteHashTmp,
        uniqueSiloedNoteHash: uniqueSiloedNoteHashTmp,
        innerNullifier: innerNullifierTmp,
      } = await this.simulator.computeNoteHashAndNullifier(
        contractAddress,
        expectedNonce,
        storageSlot,
        notePreimage.items,
      );
      siloedNoteHash = siloedNoteHashTmp;
      if (commitment.equals(uniqueSiloedNoteHashTmp)) {
        nonce = expectedNonce;
        innerNoteHash = innerNoteHashTmp;
        uniqueSiloedNoteHash = uniqueSiloedNoteHashTmp;
        innerNullifier = innerNullifierTmp;
        break;
      }
    }

    if (!nonce) {
      let errorString;
      if (siloedNoteHash == undefined) {
        errorString = 'Cannot find a matching commitment for the note.';
      } else {
        errorString = `We decrypted a log, but couldn't find a corresponding note in the tree.
This might be because the note was nullified in the same tx which created it.
In that case, everything is fine. To check whether this is the case, look back through
the logs for a notification
'important: chopped commitment for siloed inner hash note
${siloedNoteHash.toString()}'.
If you can see that notification. Everything's fine.
If that's not the case, and you can't find such a notification, something has gone wrong.
There could be a problem with the way you've defined a custom note, or with the way you're
serialising / deserialising / hashing / encrypting / decrypting that note.
Please see the following github issue to track an improvement that we're working on:
https://github.com/AztecProtocol/aztec-packages/issues/1641`;
      }

      throw new Error(errorString);
    }

    return {
      index: BigInt(dataStartIndex + commitmentIndex),
      nonce,
      innerNoteHash: innerNoteHash!,
      uniqueSiloedNoteHash: uniqueSiloedNoteHash!,
      siloedNullifier: siloNullifier(wasm, contractAddress, innerNullifier!),
    };
  }

  /**
   * Process the given blocks and their associated transaction auxiliary data.
   * This function updates the database with information about new transactions,
   * user-pertaining transaction indices, and auxiliary data. It also removes nullified
   * transaction auxiliary data from the database. This function keeps track of new nullifiers
   * and ensures all other transactions are updated with newly settled block information.
   *
   * @param blocksAndNoteSpendingInfo - Array of objects containing L2BlockContexts, user-pertaining transaction indices, and NoteSpendingInfoDaos.
   */
  private async processBlocksAndNoteSpendingInfo(blocksAndNoteSpendingInfo: ProcessedData[]) {
    const noteSpendingInfoDaosBatch = blocksAndNoteSpendingInfo.flatMap(b => b.noteSpendingInfoDaos);
    if (noteSpendingInfoDaosBatch.length) {
      await this.db.addNoteSpendingInfoBatch(noteSpendingInfoDaosBatch);
      noteSpendingInfoDaosBatch.forEach(noteSpendingInfo => {
        this.log(
          `Added note spending info for contract ${noteSpendingInfo.contractAddress} at slot ${
            noteSpendingInfo.storageSlot
          } with nullifier ${noteSpendingInfo.siloedNullifier.toString()}`,
        );
      });
    }

    const newNullifiers: Fr[] = blocksAndNoteSpendingInfo.flatMap(b => b.blockContext.block.newNullifiers);
    const removedNoteSpendingInfo = await this.db.removeNullifiedNoteSpendingInfo(newNullifiers, this.publicKey);
    removedNoteSpendingInfo.forEach(noteSpendingInfo => {
      this.log(
        `Removed note spending info for contract ${noteSpendingInfo.contractAddress} at slot ${
          noteSpendingInfo.storageSlot
        } with nullifier ${noteSpendingInfo.siloedNullifier.toString()}`,
      );
    });
  }
}
