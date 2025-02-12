import { ABIType, FunctionAbi } from '@aztec/foundation/abi';
import { Fr } from '@aztec/foundation/fields';

/**
 * The type of our decoded ABI.
 */
export type DecodedReturn = bigint | boolean | DecodedReturn[] | { [key: string]: DecodedReturn };

/**
 * Decodes return values from a function call.
 * Missing support for integer and string.
 */
class ReturnValuesDecoder {
  constructor(private abi: FunctionAbi, private flattened: Fr[]) {}

  /**
   * Decodes a single return value from field to the given type.
   * @param abiType - The type of the return value.
   * @returns The decoded return value.
   */
  private decodeReturn(abiType: ABIType): DecodedReturn {
    switch (abiType.kind) {
      case 'field':
        return this.getNextField().value;
      case 'integer':
        if (abiType.sign === 'signed') {
          throw new Error('Unsupported type: signed integer');
        }
        return this.getNextField().value;
      case 'boolean':
        return !this.getNextField().isZero();
      case 'array': {
        const array = [];
        for (let i = 0; i < abiType.length; i += 1) {
          array.push(this.decodeReturn(abiType.type));
        }
        return array;
      }
      case 'struct': {
        const struct: { [key: string]: DecodedReturn } = {};
        for (const field of abiType.fields) {
          struct[field.name] = this.decodeReturn(field.type);
        }
        return struct;
      }
      default:
        throw new Error(`Unsupported type: ${abiType.kind}`);
    }
  }

  /**
   * Gets the next field in the flattened return values.
   * @returns The next field in the flattened return values.
   */
  private getNextField(): Fr {
    const field = this.flattened.shift();
    if (!field) {
      throw new Error('Not enough return values');
    }
    return field;
  }

  /**
   * Decodes all the return values for the given function ABI.
   * Noir support only single return value
   * The return value can however be simple types, structs or arrays
   * @returns The decoded return values.
   */
  public decode(): DecodedReturn {
    if (this.abi.returnTypes.length > 1) {
      throw new Error('Multiple return values not supported');
    }
    if (this.abi.returnTypes.length === 0) {
      return [];
    }
    return this.decodeReturn(this.abi.returnTypes[0]);
  }
}

/**
 * Decodes return values from a function call.
 * @param abi - The ABI entry of the function.
 * @param returnValues - The decoded return values.
 * @returns
 */
export function decodeReturnValues(abi: FunctionAbi, returnValues: Fr[]) {
  return new ReturnValuesDecoder(abi, returnValues.slice()).decode();
}
