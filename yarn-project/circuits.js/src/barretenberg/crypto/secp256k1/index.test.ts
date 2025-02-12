import { CircuitsWasm, PrivateKey } from '../../../index.js';
import { Ecdsa } from '../ecdsa/index.js';
import { Secp256k1 } from './index.js';

describe('secp256k1', () => {
  let secp256k1!: Secp256k1;
  let ecdsa!: Ecdsa;

  beforeAll(async () => {
    const wasm = await CircuitsWasm.get();
    secp256k1 = new Secp256k1(wasm);
    ecdsa = new Ecdsa(wasm);
  });

  it('should correctly compute public key', () => {
    const privateKey = PrivateKey.random();
    const lhs = secp256k1.mul(Secp256k1.generator, privateKey.value);
    const rhs = ecdsa.computePublicKey(privateKey);
    expect(lhs).toEqual(rhs);
  });
});
