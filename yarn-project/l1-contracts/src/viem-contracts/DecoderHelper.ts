/**
 * DecoderHelper ABI for viem.
 */
export const DecoderHelperAbi = [
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_l2Block',
        type: 'bytes',
      },
    ],
    name: 'computeDiffRoot',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: '_l2Block',
        type: 'bytes',
      },
    ],
    name: 'decode',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const;
/**
 * DecoderHelper Bytecode for viem.
 */
export const DecoderHelperBytecode =
  '0x608060405234801561001057600080fd5b506109fb806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80634f93f40e1461003b578063e5c5e9a314610061575b600080fd5b61004e610049366004610745565b610094565b6040519081526020015b60405180910390f35b61007461006f366004610745565b6100a9565b604080519485526020850193909352918301526060820152608001610058565b60006100a083836100c9565b90505b92915050565b6000806000806100b98686610414565b9299919850965090945092505050565b60006100f66040518060800160405280600081526020016000815260200160008152602001600081525090565b6101ac84013560e090811c808352602090810286016101b0810135831c848301819052918202016101b4810135831c604085810191909152909102016101b80135901c6060820152600061014c600460026107cd565b825161015891906107fa565b67ffffffffffffffff8111156101705761017061080e565b604051908082528060200260200182016040528015610199578160200160208202803683370190505b5082519091506101b0906000906101b19060206107cd565b6101bc836004610824565b6101c69190610824565b90506000846020015160206101db91906107cd565b6101e6836004610824565b6101f09190610824565b905060008560400151604061020591906107cd565b610210836004610824565b61021a9190610824565b905060008660600151602061022f91906107cd565b6102399083610824565b905060005b86518110156103fc57604080516104c08082526104e0820190925260009160208201818036833701905050905060206101008d890182840137610100818101918e890190840182013761010081810191610200918f89019185010137610200818101916040918f880191850101376020600202810190506020848e0182840137602c808201916014918f870160200191850101376020810190506020603485018e0182840137602c808201916014918f8701605401918501013750610305600460026107cd565b6103109060206107cd565b61031a9088610824565b9650610328600460026107cd565b6103339060206107cd565b61033d9087610824565b955061034b600460026107cd565b6103569060406107cd565b6103609086610824565b945061036d604085610824565b935061037a606884610824565b925060028160405161038c9190610837565b602060405180830381855afa1580156103a9573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906103cc9190610866565b8883815181106103de576103de61087f565b602090810291909101015250806103f481610895565b91505061023e565b506104068661045a565b9a9950505050505050505050565b813560e01c6000808061043461042b6001866108ae565b600488886105d2565b92506104438460d888886105d2565b915061044f868661067d565b905092959194509250565b6000805b825161046b8260026109a5565b1015610483578061047b81610895565b91505061045e565b60006104908260026109a5565b905080845260005b828110156105ad5760005b8281101561059a5760028682815181106104bf576104bf61087f565b6020026020010151878360016104d59190610824565b815181106104e5576104e561087f565b6020026020010151604051602001610507929190918252602082015260400190565b60408051601f198184030181529082905261052191610837565b602060405180830381855afa15801561053e573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906105619190610866565b8661056d6002846107fa565b8151811061057d5761057d61087f565b6020908102919091010152610593600282610824565b90506104a3565b50806105a581610895565b915050610498565b50836000815181106105c1576105c161087f565b602002602001015192505050919050565b6040805160d880825261010082019092526000918291906020820181803683370190505090508560181c60208201538560101c60218201538560081c602282015385602382015360d485850160248301376002816040516106339190610837565b602060405180830381855afa158015610650573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906106739190610866565b9695505050505050565b604080516101c88082526102008201909252600091908290826020820181803683370190505090508160048601602083013760006106bb86866100c9565b90508060046101ac036020018301527f30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f00000016002836040516106fb9190610837565b602060405180830381855afa158015610718573d6000803e3d6000fd5b5050506040513d601f19601f8201168201806040525081019061073b9190610866565b61067391906109b1565b6000806020838503121561075857600080fd5b823567ffffffffffffffff8082111561077057600080fd5b818501915085601f83011261078457600080fd5b81358181111561079357600080fd5b8660208285010111156107a557600080fd5b60209290920196919550909350505050565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176100a3576100a36107b7565b634e487b7160e01b600052601260045260246000fd5b600082610809576108096107e4565b500490565b634e487b7160e01b600052604160045260246000fd5b808201808211156100a3576100a36107b7565b6000825160005b81811015610858576020818601810151858301520161083e565b506000920191825250919050565b60006020828403121561087857600080fd5b5051919050565b634e487b7160e01b600052603260045260246000fd5b6000600182016108a7576108a76107b7565b5060010190565b818103818111156100a3576100a36107b7565b600181815b808511156108fc5781600019048211156108e2576108e26107b7565b808516156108ef57918102915b93841c93908002906108c6565b509250929050565b600082610913575060016100a3565b81610920575060006100a3565b816001811461093657600281146109405761095c565b60019150506100a3565b60ff841115610951576109516107b7565b50506001821b6100a3565b5060208310610133831016604e8410600b841016171561097f575081810a6100a3565b61098983836108c1565b806000190482111561099d5761099d6107b7565b029392505050565b60006100a08383610904565b6000826109c0576109c06107e4565b50069056fea26469706673582212202ef99c8a34102a8b892857ef4d2ff1773f31770e89ceca60a0bea54a127104f064736f6c63430008120033';