mod storage;

// A contract used along with `Parent` contract to test nested calls.
contract Child {
    use dep::aztec::abi;
    use dep::aztec::abi::Hasher;
    use dep::aztec::abi::PrivateContextInputs;
    use dep::aztec::abi::PublicContextInputs;
    use dep::aztec::context::{
        PrivateContext,
        PublicContext
    };
    use crate::storage::Storage;
    use dep::aztec::oracle::logs::emit_unencrypted_log;

    #[aztec(private)]
    fn constructor()  {}

    // Returns a sum of the input and the chain id and version of the contract in private circuit public input's return_values.
    #[aztec(private)]
    fn value(
        input: Field,
    ) {
        context.return_values.push(input + context.chain_id() + context.version());
    }

    // Returns base_value + 42.
    #[aztec(public)]
    open fn pubGetValue(base_value: Field) {
        let returnValue = base_value + context.chain_id() + context.version() + context.block_number() + context.timestamp();

        context.return_values.push(returnValue);
    }

    // Sets `current_value` to `new_value`
    #[aztec(public)]
    open fn pubSetValue(new_value: Field) {
        let storage = Storage::init();
        storage.current_value.write(new_value);
        let _hash = emit_unencrypted_log(new_value);
        context.return_values.push(new_value);
    }

    // Increments `current_value` by `new_value`
    #[aztec(public)]
    open fn pubIncValue(new_value: Field) {
        let storage = Storage::init();
        let old_value = storage.current_value.read();
        storage.current_value.write(old_value + new_value);
        let _hash = emit_unencrypted_log(new_value);
        context.return_values.push(new_value);
    }

    #[aztec(public)]
    open fn setValueTwiceWithNestedFirst() {
        let pubSetValueSelector = 0x5b0f91b0;
        let _ret = context.call_public_function(context.this_address(), pubSetValueSelector, [10]);

        let storage = Storage::init();
        storage.current_value.write(20);
        let _hash = emit_unencrypted_log(20);
    }

    #[aztec(public)]
    open fn setValueTwiceWithNestedLast() {
        let storage = Storage::init();
        storage.current_value.write(20);
        let _hash = emit_unencrypted_log(20);

        let pubSetValueSelector = 0x5b0f91b0;
        let _ret = context.call_public_function(context.this_address(), pubSetValueSelector, [10]);
    }
}
