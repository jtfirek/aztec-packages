mod storage;
mod address_note;

contract PokeableToken {
    // Libs
    use dep::value_note::{
        balance_utils,
        utils::increment,
        value_note::{VALUE_NOTE_LEN, ValueNoteMethods, ValueNote},
    };
    use dep::aztec::abi;
    use dep::aztec::abi::Hasher;
    use dep::aztec::abi::PrivateContextInputs;
    use dep::aztec::context::PrivateContext;
    use dep::aztec::note::{
        note_getter::NoteGetterOptions,
        note_header::{NoteHeader},
        utils as note_utils,
    };
    use dep::aztec::types::point::Point;
    use dep::aztec::log::emit_encrypted_log;

    use crate::storage::Storage;
    use crate::address_note::{AddressNote, AddressNoteMethods};

    // Constructs the contract and sets `initial_supply` which is fully owned by `sender`.
    #[aztec(private)]
    fn constructor(
        initial_supply: Field, 
        sender: Field,
        recipient: Field
    )  {
        let storage = Storage::init();

        let mut sender_note = AddressNote::new(sender);
        let mut recipient_note = AddressNote::new(recipient);

        storage.sender.initialise(&mut context, &mut sender_note);
        storage.recipient.initialise(&mut context, &mut recipient_note);

        // Insert new note to a set of user notes and emit the newly created encrypted note preimage via oracle call.
        let sender_balance = storage.balances.at(sender);
        increment(&mut context, sender_balance, initial_supply, sender);
    }

    // Transfers full balance of tokens from `sender` to a `recipient`.
    #[aztec(private)]
    fn poke(
        sender: Field,
        recipient: Field
    ) {
        let storage = Storage::init();

        // TODO: This check is not satisfying constraints
        // let mut sender_note = AddressNote::new(sender);
        // storage.sender.assert_contains(&mut context, &mut sender_note);
        // let mut recipient_note = AddressNote::new(recipient);
        // storage.recipient.assert_contains(&mut context, &mut recipient_note);
        
        // Pick from the set of sender's notes.
        let sender_balance = storage.balances.at(sender);

        let options = NoteGetterOptions::new();
        let maybe_notes = sender_balance.get_notes(&mut context, options);
        let mut note_sum = 0;
        for i in 0..maybe_notes.len() {
            if maybe_notes[i].is_some() {
                let note = maybe_notes[i].unwrap_unchecked();

                // Ensure the notes are actually owned by the owner (to prevent user from generating a valid proof while
                // spending someone else's notes).
                assert(note.owner == sender);

                // Removes the note from the owner's set of notes.
                sender_balance.remove(&mut context, note);

                note_sum += note.value;
            }
        }

        // Create new note for the recipient.
        let recipient_balance = storage.balances.at(recipient);
        increment(&mut context, recipient_balance, note_sum, recipient);
    }

    // Helper function to get the balance of a user ("unconstrained" is a Noir alternative of Solidity's "view" function).
    unconstrained fn getBalance(
        sender: Field,
    ) -> Field {
        let storage = Storage::init();

        // Get the set of notes owned by the user.
        let sender_balance = storage.balances.at(sender);

        // Return the sum of all notes in the set.
        balance_utils::get_balance(sender_balance)
    }

    // Computes note hash and nullifier.
    // Note 1: Needs to be defined by every contract producing logs.
    // Note 2: Having it in all the contracts gives us the ability to compute the note hash and nullifier differently for different kind of notes.
    unconstrained fn compute_note_hash_and_nullifier(contract_address: Field, nonce: Field, storage_slot: Field, preimage: [Field; VALUE_NOTE_LEN]) -> [Field; 4] {
        let note_header = NoteHeader { contract_address, nonce, storage_slot };
        if (storage_slot == 1) | (storage_slot == 2) {
            note_utils::compute_note_hash_and_nullifier(AddressNoteMethods, note_header, preimage)
        } else {
            note_utils::compute_note_hash_and_nullifier(ValueNoteMethods, note_header, preimage)
        }
    }
}
