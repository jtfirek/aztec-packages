---
title: Data Structures
---

The `DataStructures` are structs that we are using throughout the message infrastructure and registry.

**Links**: [Implementation](https://github.com/AztecProtocol/aztec-packages/blob/master/l1-contracts/src/core/libraries/DataStructures.sol).

## `Entry`

An entry for the messageboxes multi-sets. 

```solidity title="DataStructures.sol"
  struct Entry {
    uint64 fee;
    uint32 count;
    uint32 version;
    uint32 deadline;
  }
```

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| `fee`          | `uint64` | The fee provided to the sequencer for including the message in the inbox. 0 if Outbox (as it is not applicable). |
| `count`        | `uint32` | The occurrence of the entry in the dataset |
| `version`      | `uint32` | The version of the entry |
| `deadline`     | `uint32` | The consumption deadline of the message. |


## `L1Actor`

An entity on L1, specifying the address and the chainId for the entity. Used when specifying sender/recipient with an entity that is on L1.

```solidity title="DataStructures.sol"
  struct L1Actor {
    address actor;
    uint256 chainId;
  }
```

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| `actor`          | `address` | The L1 address of the actor |
| `chainId`        | `uint256` | The chainId of the actor. Defines the blockchain that the actor lives on. |


## `L2Actor`

An entity on L2, specifying the address and the version for the entity. Used when specifying sender/recipient with an entity that is on L2.

```solidity title="DataStructures.sol"
  struct L2Actor {
    bytes32 actor;
    uint256 version;
  }
```

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| `actor`          | `bytes32` | The aztec address of the actor. |
| `version`        | `uint256` | The version of Aztec that the actor lives on. |

## `L1ToL2Message`

A message that is sent from L1 to L2.

```solidity title="DataStructures.sol"
  struct L1ToL2Msg {
    L1Actor sender;
    L2Actor recipient;
    bytes32 content;
    bytes32 secretHash;
    uint32 deadline;
    uint64 fee;
  }
```

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| `sender`          | `L1Actor` | The actor on L1 that is sending the message. |
| `recipient`        | `L2Actor` | The actor on L2 that is to receive the message. |
| `content`        | `field (~254 bits)` | The field element containing the content to be sent to L2. |
| `secretHash`        | `field (~254 bits)` | The hash of a secret pre-image that must be known to consume the message on L2. Use the [`computeMessageSecretHash`](https://github.com/AztecProtocol/aztec-packages/blob/master/yarn-project/aztec.js/src/utils/secrets.ts) to compute it from a secret. |
| `deadline`        | `uint32` | The message consumption-deadline time in seconds. |
| `fee`        | `uint64` | The fee that the sequencer will be paid for the inclusion of the message. |

## `L2ToL1Message`

A message that is sent from L2 to L1.

```solidity title="DataStructures.sol"
  struct L2ToL1Msg {
    DataStructures.L2Actor sender;
    DataStructures.L1Actor recipient;
    bytes32 content;
  }
```

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| `sender`          | `L2Actor` | The actor on L2 that is sending the message. |
| `recipient`        | `L1Actor` | The actor on L1 that is to receive the message. |
| `content`        | `field (~254 bits)` | The field element containing the content to be consumed by the portal on L1. |

## `RegistrySnapshot`

A snapshot of the registry values.

```solidity title="DataStructures.sol"
  struct RegistrySnapshot {
    address rollup;
    address inbox;
    address outbox;
    uint256 blockNumber;
  }
```

| Name           | Type    | Description |
| -------------- | ------- | ----------- |
| `rollup`       | `address` | The address of the rollup contract for the snapshot. |
| `inbox`       | `address` | The address of the inbox contract for the snapshot. |
| `outbox`       | `address` | The address of the outbox contract for the snapshot. |
| `blockNumber`       | `uint256` | The block number at which the snapshot was created. |




