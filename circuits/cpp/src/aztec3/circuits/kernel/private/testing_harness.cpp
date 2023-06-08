#include "testing_harness.hpp"

#include "index.hpp"
#include "init.hpp"

#include "aztec3/circuits/abis/call_context.hpp"
#include "aztec3/circuits/abis/call_stack_item.hpp"
#include "aztec3/circuits/abis/combined_accumulated_data.hpp"
#include "aztec3/circuits/abis/combined_constant_data.hpp"
#include "aztec3/circuits/abis/combined_historic_tree_roots.hpp"
#include "aztec3/circuits/abis/contract_deployment_data.hpp"
#include "aztec3/circuits/abis/function_data.hpp"
#include "aztec3/circuits/abis/kernel_circuit_public_inputs.hpp"
#include "aztec3/circuits/abis/new_contract_data.hpp"
#include "aztec3/circuits/abis/private_circuit_public_inputs.hpp"
#include "aztec3/circuits/abis/private_historic_tree_roots.hpp"
#include "aztec3/circuits/abis/private_kernel/private_call_data.hpp"
#include "aztec3/circuits/abis/signed_tx_request.hpp"
#include "aztec3/circuits/abis/tx_context.hpp"
#include "aztec3/circuits/abis/tx_request.hpp"
#include "aztec3/circuits/abis/types.hpp"
#include "aztec3/circuits/apps/function_execution_context.hpp"
#include "aztec3/circuits/hash.hpp"
#include "aztec3/circuits/kernel/private/utils.hpp"

#include "barretenberg/plonk/proof_system/prover/prover.hpp"
#include <barretenberg/common/map.hpp>
#include <barretenberg/stdlib/merkle_tree/membership.hpp>

namespace aztec3::circuits::kernel::private_kernel::testing_harness {

using aztec3::circuits::abis::CallContext;
using aztec3::circuits::abis::CallStackItem;
using aztec3::circuits::abis::CombinedAccumulatedData;
using aztec3::circuits::abis::CombinedConstantData;
using aztec3::circuits::abis::CombinedHistoricTreeRoots;
using aztec3::circuits::abis::ContractDeploymentData;
using aztec3::circuits::abis::FunctionData;
using aztec3::circuits::abis::PrivateCircuitPublicInputs;
using aztec3::circuits::abis::PrivateHistoricTreeRoots;
using aztec3::circuits::abis::PrivateTypes;
using aztec3::circuits::abis::SignedTxRequest;
using aztec3::circuits::abis::TxContext;
using aztec3::circuits::abis::TxRequest;
using aztec3::circuits::abis::private_kernel::PrivateCallData;

/**
 * @brief Generate a verification key for a private circuit.
 *
 * @details Use some dummy inputs just to get the VK for a private circuit
 *
 * @param is_constructor Whether this private call is a constructor call
 * @param func The private circuit call to generate a VK for
 * @param num_args Number of args to that private circuit call
 * @return std::shared_ptr<NT::VK> - the generated VK
 */
std::shared_ptr<NT::VK> gen_func_vk(bool is_constructor, private_function const& func, size_t const num_args)
{
    // Some dummy inputs to get the circuit to compile and get a VK
    FunctionData<NT> const dummy_function_data{
        .is_private = true,
        .is_constructor = is_constructor,
    };

    CallContext<NT> const dummy_call_context{
        .is_contract_deployment = is_constructor,
    };

    // Dummmy invokation of private call circuit, in order to derive its vk
    Composer dummy_composer = Composer("../barretenberg/cpp/srs_db/ignition");
    {
        DB dummy_db;
        NativeOracle dummy_oracle = is_constructor
                                        ? NativeOracle(dummy_db, 0, dummy_function_data, dummy_call_context, {}, 0)
                                        : NativeOracle(dummy_db, 0, dummy_function_data, dummy_call_context, 0);

        OracleWrapper dummy_oracle_wrapper = OracleWrapper(dummy_composer, dummy_oracle);

        FunctionExecutionContext dummy_ctx(dummy_composer, dummy_oracle_wrapper);

        // if args are value 0, deposit circuit errors when inserting utxo notes
        std::vector<NT::fr> const dummy_args = { 1, 1, 1, 1, 1, 1, 1, 1 };
        // Make call to private call circuit itself to lay down constraints
        func(dummy_ctx, dummy_args);
        // FIXME remove arg
        (void)num_args;
    }

    // Now we can derive the vk:
    return dummy_composer.compute_verification_key("../barretenberg/cpp/srs_db/ignition");
}

std::pair<PrivateCallData<NT>, ContractDeploymentData<NT>> create_private_call_deploy_data(
    bool const is_constructor,
    private_function const& func,
    std::vector<NT::fr> const& args_vec,
    NT::address const& msg_sender,
    std::array<NT::fr, 2> const& encrypted_logs_hash,
    NT::fr const& encrypted_log_preimages_length,
    bool is_circuit)
{
    //***************************************************************************
    // Initialize some inputs to private call and kernel circuits
    //***************************************************************************
    // TODO(suyash) randomize inputs
    NT::address contract_address = is_constructor ? 0 : 12345;  // updated later if in constructor
    const NT::uint32 contract_leaf_index = 1;
    const NT::uint32 function_leaf_index = 1;
    const NT::fr portal_contract_address = 23456;
    const NT::fr contract_address_salt = 34567;
    const NT::fr acir_hash = 12341234;

    const NT::fr msg_sender_private_key = 123456789;

    FunctionData<NT> const function_data{
        .function_selector = 1,  // TODO(suyash): deduce this from the contract, somehow.
        .is_private = true,
        .is_constructor = is_constructor,
    };

    CallContext<NT> call_context{
        .msg_sender = msg_sender,
        .storage_contract_address = contract_address,
        .portal_contract_address = portal_contract_address,
        .is_delegate_call = false,
        .is_static_call = false,
        .is_contract_deployment = is_constructor,
    };

    // sometimes need private call args as array
    std::array<NT::fr, ARGS_LENGTH> args{};
    for (size_t i = 0; i < args_vec.size(); ++i) {
        args[i] = args_vec[i];
    }

    //***************************************************************************
    // Initialize contract related information like private call VK (and its hash),
    // function tree, contract tree, contract address for newly deployed contract,
    // etc...
    //***************************************************************************

    // generate private circuit VK and its hash using circuit with dummy inputs
    // it is needed below:
    //     for constructors - to generate the contract address, function leaf, etc
    //     for private calls - to generate the function leaf, etc
    auto const private_circuit_vk = is_circuit ? gen_func_vk(is_constructor, func, args_vec.size()) : utils::fake_vk();

    const NT::fr private_circuit_vk_hash =
        stdlib::recursion::verification_key<CT::bn254>::compress_native(private_circuit_vk, GeneratorIndex::VK);

    ContractDeploymentData<NT> contract_deployment_data{};
    NT::fr contract_tree_root = 0;  // TODO(david) set properly for constructor?
    if (is_constructor) {
        // TODO(david) compute function tree root from leaves
        // create leaf preimage for each function and hash all into tree
        // push to array/vector
        // use variation of `compute_root_partial_left_tree` to compute the root from leaves
        // const auto& function_leaf_preimage = FunctionLeafPreimage<NT>{
        //    .function_selector = function_data.function_selector,
        //    .is_private = function_data.is_private,
        //    .vk_hash = private_circuit_vk_hash,
        //    .acir_hash = acir_hash,
        //};
        std::vector<NT::fr> const function_leaves(MAX_FUNCTION_LEAVES, EMPTY_FUNCTION_LEAF);
        // const NT::fr& function_tree_root = plonk::stdlib::merkle_tree::compute_tree_root_native(function_leaves);

        // TODO(david) use actual function tree root computed from leaves
        // update cdd with actual info
        contract_deployment_data = {
            .constructor_vk_hash = private_circuit_vk_hash,
            .function_tree_root = plonk::stdlib::merkle_tree::compute_tree_root_native(function_leaves),
            .contract_address_salt = contract_address_salt,
            .portal_contract_address = portal_contract_address,
        };

        // Get constructor hash for use when deriving contract address
        auto constructor_hash =
            compute_constructor_hash<NT>(function_data, compute_var_args_hash<NT>(args_vec), private_circuit_vk_hash);

        // Derive contract address so that it can be used inside the constructor itself
        contract_address = compute_contract_address<NT>(
            msg_sender, contract_address_salt, contract_deployment_data.function_tree_root, constructor_hash);
        // update the contract address in the call context now that it is known
        call_context.storage_contract_address = contract_address;
    } else {
        const NT::fr& function_tree_root = function_tree_root_from_siblings<NT>(function_data.function_selector,
                                                                                function_data.is_private,
                                                                                private_circuit_vk_hash,
                                                                                acir_hash,
                                                                                function_leaf_index,
                                                                                get_empty_function_siblings());

        // update contract_tree_root with real value
        contract_tree_root = contract_tree_root_from_siblings<NT>(function_tree_root,
                                                                  contract_address,
                                                                  portal_contract_address,
                                                                  contract_leaf_index,
                                                                  get_empty_contract_siblings());
    }

    //***************************************************************************
    // Create a private circuit/call using composer, oracles, execution context
    // Generate its proof and public inputs for submission with a TX request
    //***************************************************************************
    Composer private_circuit_composer = Composer("../barretenberg/cpp/srs_db/ignition");

    DB dummy_db;
    NativeOracle oracle =
        is_constructor ? NativeOracle(dummy_db,
                                      contract_address,
                                      function_data,
                                      call_context,
                                      contract_deployment_data,
                                      msg_sender_private_key)
                       : NativeOracle(dummy_db, contract_address, function_data, call_context, msg_sender_private_key);

    OracleWrapper oracle_wrapper = OracleWrapper(private_circuit_composer, oracle);

    FunctionExecutionContext ctx(private_circuit_composer, oracle_wrapper);

    OptionalPrivateCircuitPublicInputs<NT> const opt_private_circuit_public_inputs = func(ctx, args_vec);
    PrivateCircuitPublicInputs<NT> private_circuit_public_inputs =
        opt_private_circuit_public_inputs.remove_optionality();
    // TODO(suyash): this should likely be handled as part of the DB/Oracle/Context infrastructure
    private_circuit_public_inputs.historic_contract_tree_root = contract_tree_root;

    private_circuit_public_inputs.encrypted_logs_hash = encrypted_logs_hash;
    private_circuit_public_inputs.encrypted_log_preimages_length = encrypted_log_preimages_length;

    // Omit the proof for native tests
    NT::Proof private_circuit_proof;
    if (is_circuit) {
        auto private_circuit_prover = private_circuit_composer.create_prover();
        private_circuit_proof = private_circuit_prover.construct_proof();
    }

    const CallStackItem<NT, PrivateTypes> call_stack_item{
        .contract_address = contract_address,
        .function_data = function_data,
        .public_inputs = private_circuit_public_inputs,
    };

    //***************************************************************************
    // Now we can construct the full private inputs to the kernel circuit
    //***************************************************************************

    return std::pair<PrivateCallData<NT>, ContractDeploymentData<NT>>(
    PrivateCallData<NT>{
        .call_stack_item = call_stack_item,
        .private_call_stack_preimages = ctx.get_private_call_stack_items(),

        .proof = private_circuit_proof,
        .vk = private_circuit_vk,

        .function_leaf_membership_witness = {
            .leaf_index = function_leaf_index,
            .sibling_path = get_empty_function_siblings(),
        },

        .contract_leaf_membership_witness = {
            .leaf_index = contract_leaf_index,
            .sibling_path = get_empty_contract_siblings(),
        },

        .portal_contract_address = portal_contract_address,

        .acir_hash = acir_hash
    },
    contract_deployment_data);
}

/**
 * @brief Perform an initil private circuit call and generate the inputs to private kernel
 *
 * @param is_constructor whether this private circuit call is a constructor
 * @param func the private circuit call being validated by this kernel iteration
 * @param args_vec the private call's args
 * @param is_circuit boolean to switch to circuit or native (fake vk and no proof)
 * @return PrivateInputsInit<NT> - the inputs to the private call circuit of an init iteration
 */
PrivateKernelInputsInit<NT> do_private_call_get_kernel_inputs_init(bool const is_constructor,
                                                                   private_function const& func,
                                                                   std::vector<NT::fr> const& args_vec,
                                                                   std::array<NT::fr, 2> const& encrypted_logs_hash,
                                                                   NT::fr const& encrypted_log_preimages_length,
                                                                   bool is_circuit)
{
    //***************************************************************************
    // Initialize some inputs to private call and kernel circuits
    //***************************************************************************
    // TODO(suyash) randomize inputs

    const NT::address msg_sender =
        NT::fr(uint256_t(0x01071e9a23e0f7edULL, 0x5d77b35d1830fa3eULL, 0xc6ba3660bb1f0c0bULL, 0x2ef9f7f09867fd6eULL));
    const NT::address& tx_origin = msg_sender;

    auto const& [private_call_data, contract_deployment_data] = create_private_call_deploy_data(
        is_constructor, func, args_vec, msg_sender, encrypted_logs_hash, encrypted_log_preimages_length, is_circuit);

    //***************************************************************************
    // We can create a TxRequest from some of the above data. Users must sign a TxRequest in order to give permission
    // for a tx to take place - creating a SignedTxRequest.
    //***************************************************************************
    auto const tx_request = TxRequest<NT>{
        .from = tx_origin,
        .to = private_call_data.call_stack_item.contract_address,
        .function_data = private_call_data.call_stack_item.function_data,
        .args_hash = compute_var_args_hash<NT>(args_vec),
        .nonce = 0,
        .tx_context =
            TxContext<NT>{
                .is_fee_payment_tx = false,
                .is_rebate_payment_tx = false,
                .is_contract_deployment_tx = is_constructor,
                .contract_deployment_data = contract_deployment_data,
            },
        .chain_id = 1,
    };

    auto const signed_tx_request = SignedTxRequest<NT>{
        .tx_request = tx_request,

        //.signature = TODO: need a method for signing a TxRequest.
    };

    //***************************************************************************
    // Now we can construct the full private inputs to the kernel circuit
    //***************************************************************************
    PrivateKernelInputsInit<NT> kernel_private_inputs = PrivateKernelInputsInit<NT>{
        .signed_tx_request = signed_tx_request,
        .private_call = private_call_data,
    };

    return kernel_private_inputs;
}


/**
 * @brief Perform an inner private circuit call and generate the inputs to private kernel
 *
 * @param is_constructor whether this private circuit call is a constructor
 * @param func the private circuit call being validated by this kernel iteration
 * @param args_vec the private call's args
 * @param is_circuit boolean to switch to circuit or native (fake vk and no proof)
 * @return PrivateInputsInner<NT> - the inputs to the private call circuit of an inner iteration
 */
PrivateKernelInputsInner<NT> do_private_call_get_kernel_inputs_inner(bool const is_constructor,
                                                                     private_function const& func,
                                                                     std::vector<NT::fr> const& args_vec,
                                                                     std::array<NT::fr, 2> const& encrypted_logs_hash,
                                                                     NT::fr const& encrypted_log_preimages_length,
                                                                     bool is_circuit)
{
    //***************************************************************************
    // Initialize some inputs to private call and kernel circuits
    //***************************************************************************
    // TODO(suyash) randomize inputs

    const NT::address msg_sender =
        NT::fr(uint256_t(0x01071e9a23e0f7edULL, 0x5d77b35d1830fa3eULL, 0xc6ba3660bb1f0c0bULL, 0x2ef9f7f09867fd6eULL));

    auto const& [private_call_data, contract_deployment_data] = create_private_call_deploy_data(
        is_constructor, func, args_vec, msg_sender, encrypted_logs_hash, encrypted_log_preimages_length, is_circuit);

    const TxContext<NT> tx_context = TxContext<NT>{
        .is_fee_payment_tx = false,
        .is_rebate_payment_tx = false,
        .is_contract_deployment_tx = is_constructor,
        .contract_deployment_data = contract_deployment_data,
    };

    //***************************************************************************
    // We mock a kernel circuit proof to initialize ipnut required by an inner call
    //***************************************************************************

    std::array<NT::fr, KERNEL_PRIVATE_CALL_STACK_LENGTH> initial_kernel_private_call_stack{};
    initial_kernel_private_call_stack[0] = private_call_data.call_stack_item.hash();

    auto const& private_circuit_public_inputs = private_call_data.call_stack_item.public_inputs;
    // Get dummy previous kernel
    auto mock_previous_kernel = utils::dummy_previous_kernel(is_circuit);
    // Fill in some important fields in public inputs
    mock_previous_kernel.public_inputs.end.private_call_stack = initial_kernel_private_call_stack;
    mock_previous_kernel.public_inputs.constants = CombinedConstantData<NT>{
        .historic_tree_roots =
            CombinedHistoricTreeRoots<NT>{
                .private_historic_tree_roots =
                    PrivateHistoricTreeRoots<NT>{
                        .private_data_tree_root = private_circuit_public_inputs.historic_private_data_tree_root,
                        .contract_tree_root = private_circuit_public_inputs.historic_contract_tree_root,
                    },
            },
        .tx_context = tx_context,
    };
    mock_previous_kernel.public_inputs.is_private = true;

    //***************************************************************************
    // Now we can construct the full private inputs to the kernel circuit
    //***************************************************************************
    PrivateKernelInputsInner<NT> kernel_private_inputs = PrivateKernelInputsInner<NT>{
        .previous_kernel = mock_previous_kernel,
        .private_call = private_call_data,
    };

    return kernel_private_inputs;
}

/**
 * @brief Validate that the deployed contract address is correct.
 *
 * @details Compare the public inputs new contract address
 * with one manually computed from private inputs.
 * @param private_inputs to be used in manual computation
 * @param public_inputs that contain the expected new contract address
 */
bool validate_deployed_contract_address(PrivateKernelInputsInit<NT> const& private_inputs,
                                        KernelCircuitPublicInputs<NT> const& public_inputs)
{
    auto tx_request = private_inputs.signed_tx_request.tx_request;
    auto cdd = private_inputs.signed_tx_request.tx_request.tx_context.contract_deployment_data;

    auto private_circuit_vk_hash = stdlib::recursion::verification_key<CT::bn254>::compress_native(
        private_inputs.private_call.vk, GeneratorIndex::VK);
    auto private_call_function_data_hash = private_inputs.private_call.call_stack_item.function_data.hash();

    auto expected_constructor_hash =
        NT::compress({ private_call_function_data_hash, tx_request.args_hash, private_circuit_vk_hash }, CONSTRUCTOR);

    NT::fr const expected_contract_address =
        NT::compress({ tx_request.from, cdd.contract_address_salt, cdd.function_tree_root, expected_constructor_hash },
                     CONTRACT_ADDRESS);
    return (public_inputs.end.new_contracts[0].contract_address.to_field() == expected_contract_address);
}

bool validate_no_new_deployed_contract(KernelCircuitPublicInputs<NT> const& public_inputs)
{
    return (public_inputs.end.new_contracts == CombinedAccumulatedData<NT>{}.new_contracts);
}

}  // namespace aztec3::circuits::kernel::private_kernel::testing_harness