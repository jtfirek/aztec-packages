/* Autogenerated file, do not edit! */
  
use dep::std;
use dep::aztec::context::PrivateContext;
use dep::aztec::constants_gen::RETURN_VALUES_LENGTH;


struct PrivateTokenAirdropContractInterface {
  address: Field,
}

impl PrivateTokenAirdropContractInterface {
  fn at(address: Field) -> Self {
      Self {
          address,
      }
  }
  
  fn batchTransfer(
    self,
    context: &mut PrivateContext,
    sender: Field,
    amounts: [Field;3],
    recipients: [Field;3],
    spend_note_offset: u32
  ) -> [Field; RETURN_VALUES_LENGTH] {
    let mut serialised_args = [0; 8];
    serialised_args[0] = sender;
    serialised_args[1] = amounts[0];
    serialised_args[2] = amounts[1];
    serialised_args[3] = amounts[2];
    serialised_args[4] = recipients[0];
    serialised_args[5] = recipients[1];
    serialised_args[6] = recipients[2];
    serialised_args[7] = spend_note_offset as Field;

    context.call_private_function(self.address, 0x88bd156f, serialised_args)
  }
  

  fn burn(
    self,
    context: &mut PrivateContext,
    amount: Field,
    owner: Field
  ) -> [Field; RETURN_VALUES_LENGTH] {
    let mut serialised_args = [0; 2];
    serialised_args[0] = amount;
    serialised_args[1] = owner;

    context.call_private_function(self.address, 0x7ecb218a, serialised_args)
  }
  

  fn claim(
    self,
    context: &mut PrivateContext,
    amount: Field,
    secret: Field,
    owner: Field
  ) -> [Field; RETURN_VALUES_LENGTH] {
    let mut serialised_args = [0; 3];
    serialised_args[0] = amount;
    serialised_args[1] = secret;
    serialised_args[2] = owner;

    context.call_private_function(self.address, 0x9f7bacc8, serialised_args)
  }
  

  fn createClaims(
    self,
    context: &mut PrivateContext,
    amounts: [Field;2],
    secrets: [Field;2]
  ) -> [Field; RETURN_VALUES_LENGTH] {
    let mut serialised_args = [0; 4];
    serialised_args[0] = amounts[0];
    serialised_args[1] = amounts[1];
    serialised_args[2] = secrets[0];
    serialised_args[3] = secrets[1];

    context.call_private_function(self.address, 0xcaf1f505, serialised_args)
  }
  

  fn mint(
    self,
    context: &mut PrivateContext,
    amount: Field,
    owner: Field
  ) -> [Field; RETURN_VALUES_LENGTH] {
    let mut serialised_args = [0; 2];
    serialised_args[0] = amount;
    serialised_args[1] = owner;

    context.call_private_function(self.address, 0x1dc9c3c0, serialised_args)
  }
  

  fn transfer(
    self,
    context: &mut PrivateContext,
    amount: Field,
    recipient: Field
  ) -> [Field; RETURN_VALUES_LENGTH] {
    let mut serialised_args = [0; 2];
    serialised_args[0] = amount;
    serialised_args[1] = recipient;

    context.call_private_function(self.address, 0x61dd7032, serialised_args)
  }
  
}

