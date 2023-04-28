/**
 * Rollup ABI for viem.
 */
export const RollupAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'InvalidProof',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'expected',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 'actual',
        type: 'bytes32',
      },
    ],
    name: 'InvalidStateHash',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'blockNum',
        type: 'uint256',
      },
    ],
    name: 'L2BlockProcessed',
    type: 'event',
  },
  {
    inputs: [],
    name: 'VERIFIER',
    outputs: [
      {
        internalType: 'contract MockVerifier',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_proof',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: '_l2Block',
        type: 'bytes',
      },
    ],
    name: 'process',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'rollupStateHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const RollupBytecode =
  '0x60a060405234801561001057600080fd5b5060405161001d9061004b565b604051809103906000f080158015610039573d6000803e3d6000fd5b506001600160a01b0316608052610058565b61019d80610cd583390190565b608051610c5c61007960003960008181604b015261016b0152610c5c6000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806308c84e70146100465780631ab9c6031461008a5780637c39d130146100a1575b600080fd5b61006d7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020015b60405180910390f35b61009360005481565b604051908152602001610081565b6100b46100af3660046108bb565b6100b6565b005b6000806000806100c68686610237565b60005493975091955093509150158015906100e357508260005414155b1561011357600054604051632d2ef59f60e11b815260048101919091526024810184905260440160405180910390fd5b60408051600180825281830190925260009160208083019080368337019050509050818160008151811061014957610149610996565b6020908102919091010152604051633a94343960e21b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169063ea50d0e4906101a2908b9085906004016109d0565b602060405180830381865afa1580156101bf573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101e39190610a4a565b610200576040516309bde33960e01b815260040160405180910390fd5b600083815560405186917f655779015b9b95c7fd18f01ea4619ab4c31289bbe134ba85c5b20bcdeb1dabf391a25050505050505050565b813560e01c6000808061025761024e600186610a89565b6004888861027d565b92506102668460b8888861027d565b91506102728686610327565b905092959194509250565b6040805160b880825260e082019092526000918291906020820181803683370190505090508560181c60208201538560101c60218201538560081c602282015385602382015360b485850160248301376002816040516102dd9190610a9c565b602060405180830381855afa1580156102fa573d6000803e3d6000fd5b5050506040513d601f19601f8201168201806040525081019061031d9190610ab8565b9695505050505050565b6040805161018c8082526101c082019092526000919082908260208201818036833701905050905081602086016020830137600061036586866103cd565b90508061016c6020018301526002826040516103819190610a9c565b602060405180830381855afa15801561039e573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906103c19190610ab8565b93505050505b92915050565b60006103f360405180606001604052806000815260200160008152602001600081525090565b61016c84013560e01c80825261040a600482610ad1565b6020830152600061041c600480610af3565b836020015161042b9190610b06565b610436906020610b06565b8601610174013560e01c60408401525050602081015160009061045b90600290610ad1565b67ffffffffffffffff8111156104735761047361085c565b60405190808252806020026020018201604052801561049c578160200160208202803683370190505b50905060006104ad60046020610b06565b6104b8906002610b06565b905060006104c860046020610b06565b6104d3906002610b06565b6104dd9083610af3565b8451909150610170906000906104f4906020610b06565b61050090610174610af3565b9050600061050f600480610af3565b865161051c906002610b06565b6105269190610b06565b610531906020610b06565b61053d90610178610af3565b90506000876040015160206105529190610b06565b61055c9083610af3565b905060005b87518110156106cb57604080516102c08082526102e082019092526000916020820181803683370190505090506101008d860160208301376101008d8701828a016020013760408d85018289016020013760208d84018289016060013760148d8401602001828901608c013760208d840160340182890160a0013760148d840160540182890160cc01376105f760046002610b06565b610602906020610b06565b61060c9087610af3565b955061061a60046002610b06565b610625906020610b06565b61062f9086610af3565b945061063c604085610af3565b9350610649606884610af3565b925060028160405161065b9190610a9c565b602060405180830381855afa158015610678573d6000803e3d6000fd5b5050506040513d601f19601f8201168201806040525081019061069b9190610ab8565b8983815181106106ad576106ad610996565b602090810291909101015250806106c381610b1d565b915050610561565b506106d5876106e4565b9b9a5050505050505050505050565b6000805b82516106f5826002610c1a565b101561070d578061070581610b1d565b9150506106e8565b600061071a826002610c1a565b905080845260005b828110156108375760005b8281101561082457600286828151811061074957610749610996565b60200260200101518783600161075f9190610af3565b8151811061076f5761076f610996565b6020026020010151604051602001610791929190918252602082015260400190565b60408051601f19818403018152908290526107ab91610a9c565b602060405180830381855afa1580156107c8573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906107eb9190610ab8565b866107f7600284610ad1565b8151811061080757610807610996565b602090810291909101015261081d600282610af3565b905061072d565b508061082f81610b1d565b915050610722565b508360008151811061084b5761084b610996565b602002602001015192505050919050565b634e487b7160e01b600052604160045260246000fd5b60008083601f84011261088457600080fd5b50813567ffffffffffffffff81111561089c57600080fd5b6020830191508360208285010111156108b457600080fd5b9250929050565b6000806000604084860312156108d057600080fd5b833567ffffffffffffffff808211156108e857600080fd5b818601915086601f8301126108fc57600080fd5b81358181111561090e5761090e61085c565b604051601f8201601f19908116603f011681019083821181831017156109365761093661085c565b8160405282815289602084870101111561094f57600080fd5b82602086016020830137600060208483010152809750505050602086013591508082111561097c57600080fd5b5061098986828701610872565b9497909650939450505050565b634e487b7160e01b600052603260045260246000fd5b60005b838110156109c75781810151838201526020016109af565b50506000910152565b604081526000835180604084015260206109f082606086018389016109ac565b6060601f19601f93909301929092168401848103830185830152855192810183905285820192600091608001905b80831015610a3e5784518252938301936001929092019190830190610a1e565b50979650505050505050565b600060208284031215610a5c57600080fd5b81518015158114610a6c57600080fd5b9392505050565b634e487b7160e01b600052601160045260246000fd5b818103818111156103c7576103c7610a73565b60008251610aae8184602087016109ac565b9190910192915050565b600060208284031215610aca57600080fd5b5051919050565b600082610aee57634e487b7160e01b600052601260045260246000fd5b500490565b808201808211156103c7576103c7610a73565b80820281158282048414176103c7576103c7610a73565b600060018201610b2f57610b2f610a73565b5060010190565b600181815b80851115610b71578160001904821115610b5757610b57610a73565b80851615610b6457918102915b93841c9390800290610b3b565b509250929050565b600082610b88575060016103c7565b81610b95575060006103c7565b8160018114610bab5760028114610bb557610bd1565b60019150506103c7565b60ff841115610bc657610bc6610a73565b50506001821b6103c7565b5060208310610133831016604e8410600b8410161715610bf4575081810a6103c7565b610bfe8383610b36565b8060001904821115610c1257610c12610a73565b029392505050565b6000610a6c8383610b7956fea264697066735822122021b575358201f510292304dee8ff0dab00e9e7f61e6648f118612b5aa4418aca64736f6c63430008120033608060405234801561001057600080fd5b5061017d806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063937f6a101461003b578063ea50d0e41461005a575b600080fd5b60405168496d2061206d6f636b60b81b81526020015b60405180910390f35b610072610068366004610082565b6001949350505050565b6040519015158152602001610051565b6000806000806040858703121561009857600080fd5b843567ffffffffffffffff808211156100b057600080fd5b818701915087601f8301126100c457600080fd5b8135818111156100d357600080fd5b8860208285010111156100e557600080fd5b60209283019650945090860135908082111561010057600080fd5b818701915087601f83011261011457600080fd5b81358181111561012357600080fd5b8860208260051b850101111561013857600080fd5b9598949750506020019450505056fea26469706673582212201cde3efc6f22394dee1d1854704dd42002ec8d4ff26954e8a2709bbb37c4b5ad64736f6c63430008120033';