import { PrivateKey } from '@aztec/circuits.js';
import { EthAddress } from '@aztec/foundation/eth-address';

import { GlobalReaderConfig } from './global_variable_builder/index.js';
import { PublisherConfig, TxSenderConfig } from './publisher/config.js';
import { SequencerConfig } from './sequencer/config.js';

/**
 * Configuration settings for the SequencerClient.
 */
export type SequencerClientConfig = PublisherConfig & TxSenderConfig & SequencerConfig & GlobalReaderConfig;

/**
 * Creates an instance of SequencerClientConfig out of environment variables using sensible defaults for integration testing if not set.
 */
export function getConfigEnvVars(): SequencerClientConfig {
  const {
    SEQ_PUBLISHER_PRIVATE_KEY,
    ETHEREUM_HOST,
    CHAIN_ID,
    VERSION,
    API_KEY,
    SEQ_REQUIRED_CONFS,
    SEQ_PUBLISH_RETRY_INTERVAL_MS,
    SEQ_TX_POLLING_INTERVAL_MS,
    SEQ_MAX_TX_PER_BLOCK,
    SEQ_MIN_TX_PER_BLOCK,
    ROLLUP_CONTRACT_ADDRESS,
    INBOX_CONTRACT_ADDRESS,
    CONTRACT_DEPLOYMENT_EMITTER_ADDRESS,
  } = process.env;

  return {
    rpcUrl: ETHEREUM_HOST ? ETHEREUM_HOST : '',
    chainId: CHAIN_ID ? +CHAIN_ID : 31337, // 31337 is the default chain id for anvil
    version: VERSION ? +VERSION : 1, // 1 is our default version
    apiKey: API_KEY,
    requiredConfirmations: SEQ_REQUIRED_CONFS ? +SEQ_REQUIRED_CONFS : 1,
    l1BlockPublishRetryIntervalMS: SEQ_PUBLISH_RETRY_INTERVAL_MS ? +SEQ_PUBLISH_RETRY_INTERVAL_MS : 1_000,
    transactionPollingIntervalMS: SEQ_TX_POLLING_INTERVAL_MS ? +SEQ_TX_POLLING_INTERVAL_MS : 1_000,
    rollupContract: ROLLUP_CONTRACT_ADDRESS ? EthAddress.fromString(ROLLUP_CONTRACT_ADDRESS) : EthAddress.ZERO,
    inboxContract: INBOX_CONTRACT_ADDRESS ? EthAddress.fromString(INBOX_CONTRACT_ADDRESS) : EthAddress.ZERO,
    contractDeploymentEmitterContract: CONTRACT_DEPLOYMENT_EMITTER_ADDRESS
      ? EthAddress.fromString(CONTRACT_DEPLOYMENT_EMITTER_ADDRESS)
      : EthAddress.ZERO,
    publisherPrivateKey: SEQ_PUBLISHER_PRIVATE_KEY
      ? PrivateKey.fromString(SEQ_PUBLISHER_PRIVATE_KEY)
      : new PrivateKey(Buffer.alloc(32)),
    maxTxsPerBlock: SEQ_MAX_TX_PER_BLOCK ? +SEQ_MAX_TX_PER_BLOCK : 32,
    minTxsPerBlock: SEQ_MIN_TX_PER_BLOCK ? +SEQ_MIN_TX_PER_BLOCK : 1,
  };
}
