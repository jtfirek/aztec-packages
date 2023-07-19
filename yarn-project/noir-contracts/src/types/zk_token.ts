/* Autogenerated file, do not edit! */

/* eslint-disable */
import {
  AztecAddress,
  Contract,
  ContractFunctionInteraction,
  ContractMethod,
  DeployMethod,
  Wallet,
} from '@aztec/aztec.js';
import { ContractAbi } from '@aztec/foundation/abi';
import { Fr, Point } from '@aztec/foundation/fields';
import { AztecRPC } from '@aztec/types';

import { ZkTokenContractAbi } from '../artifacts/index.js';

/**
 * Type-safe interface for contract ZkToken;
 */
export class ZkTokenContract extends Contract {
  constructor(
    /** The deployed contract's address. */
    address: AztecAddress,
    /** The wallet. */
    wallet: Wallet,
  ) {
    super(address, ZkTokenContractAbi, wallet);
  }

  /**
   * Creates a tx to deploy a new instance of this contract.
   */
  public static deploy(
    rpc: AztecRPC,
    initial_supply: Fr | bigint | number | { toField: () => Fr },
    owner: Fr | bigint | number | { toField: () => Fr },
  ) {
    return new DeployMethod(Point.ZERO, rpc, ZkTokenContractAbi, Array.from(arguments).slice(1));
  }

  /**
   * Creates a tx to deploy a new instance of this contract using the specified public key to derive the address.
   */
  public static deployWithPublicKey(
    rpc: AztecRPC,
    publicKey: Point,
    initial_supply: Fr | bigint | number | { toField: () => Fr },
    owner: Fr | bigint | number | { toField: () => Fr },
  ) {
    return new DeployMethod(publicKey, rpc, ZkTokenContractAbi, Array.from(arguments).slice(2));
  }

  /**
   * Returns this contract's ABI.
   */
  public static get abi(): ContractAbi {
    return ZkTokenContractAbi;
  }

  /** Type-safe wrappers for the public methods exposed by the contract. */
  public methods!: {
    /** claim(amount: field, secret: field, owner: field) */
    claim: ((
      amount: Fr | bigint | number | { toField: () => Fr },
      secret: Fr | bigint | number | { toField: () => Fr },
      owner: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** createClaims(amounts: array, secrets: array, sender: field) */
    createClaims: ((
      amounts: (Fr | bigint | number | { toField: () => Fr })[],
      secrets: (Fr | bigint | number | { toField: () => Fr })[],
      sender: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** getBalance(owner: field) */
    getBalance: ((owner: Fr | bigint | number | { toField: () => Fr }) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** mint(amount: field, owner: field) */
    mint: ((
      amount: Fr | bigint | number | { toField: () => Fr },
      owner: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** stev(contract_address: field, nonce: field, storage_slot: field, preimage: array) */
    stev: ((
      contract_address: Fr | bigint | number | { toField: () => Fr },
      nonce: Fr | bigint | number | { toField: () => Fr },
      storage_slot: Fr | bigint | number | { toField: () => Fr },
      preimage: (Fr | bigint | number | { toField: () => Fr })[],
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;

    /** transfer(amount: field, sender: field, recipient: field) */
    transfer: ((
      amount: Fr | bigint | number | { toField: () => Fr },
      sender: Fr | bigint | number | { toField: () => Fr },
      recipient: Fr | bigint | number | { toField: () => Fr },
    ) => ContractFunctionInteraction) &
      Pick<ContractMethod, 'selector'>;
  };
}
