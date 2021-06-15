import sha256 from 'crypto-js/sha256';
import { injectable } from 'inversify';
import { EventEmitter } from 'events';
import { IInternalState } from './interfaces/IInternalState';

@injectable()
export class InternalState implements IInternalState {
  private readonly _seedLength = 440;
  private readonly _outLength = 256;

  private _state = 'UNSEEDED';

  private _value!: bigint;
  private _constant!: bigint;
  private _reseedCounter!: number;
  private _shouldReseedCounter!: bigint;
  private _internalStateEmitter: EventEmitter;

  constructor() {
    this._reseedCounter = 1;
    this._internalStateEmitter = new EventEmitter();
  }

  public getState(): string {
    return this._state;
  }

  public getValue(): bigint {
    return this._value;
  }

  public getConstant(): bigint {
    return this._constant;
  }

  public getReseedCounter(): number {
    return this._reseedCounter;
  }

  public getShouldReseedCounter(): bigint {
    return this._shouldReseedCounter;
  }

  public getInternalStateEmitter(): EventEmitter {
    return this._internalStateEmitter;
  }

  public setState(newState: string): void {
    this._state = newState;
  }

  public reseed(entropyInput: bigint): void {
    const seedMaterial = 0x01n | this._value | entropyInput;
    this.seed(seedMaterial);
    this._reseedCounter += 1;
  }

  public generate(outputLength = 256): bigint {
    if (outputLength > Math.pow(2, 19) || outputLength < 1) {
      console.error('Given output length must be between 1 and 2^19 bits inclusive.');
      return -1n;
    }

    const generatedBits = this.hashgen(outputLength);
    const hash = sha256((0x03n | this._value).toString()).toString();

    this._value =
      (this._value + this.sha256ToBigInt(hash) + this._constant + this._shouldReseedCounter) %
      BigInt(Math.pow(2, this._seedLength));

    this._shouldReseedCounter += 1n;

    this._internalStateEmitter.emit(
      'internalStateUpdate',
      this._state,
      this._value,
      this._constant,
      this._reseedCounter,
      this._shouldReseedCounter
    );

    return generatedBits;
  }

  public seed(seedMaterial: bigint): void {
    this._value = this.hashdf(seedMaterial.toString(), this._seedLength);
    this._constant = this.hashdf('0x00' + this._value.toString(), this._seedLength);
    this._shouldReseedCounter = 1n;

    if (this._state == 'UNSEEDED') this._state = 'SEEDED';

    this._internalStateEmitter.emit(
      'internalStateUpdate',
      this._state,
      this._value,
      this._constant,
      this._reseedCounter,
      this._shouldReseedCounter
    );
  }

  private hashgen(noOfBitsToReturn: number): bigint {
    const len = Math.ceil(noOfBitsToReturn / this._outLength);

    let data = this._value;

    let W = 0n;
    for (let i = 1; i <= len; i++) {
      const w = sha256(data.toString()).toString();

      if (i === 1) W = this.sha256ToBigInt(w);
      else {
        W = W | this.sha256ToBigInt(w);
      }
      data = (data + 1n) % BigInt(Math.pow(2, this._seedLength));
    }

    return W >> BigInt(this._outLength - noOfBitsToReturn);
  }

  private hashdf(inputString: string, noOfBitsToReturn: number): bigint {
    let temp = 0n;
    const len = Math.ceil(noOfBitsToReturn / this._outLength);

    let counter = 1n;

    for (let i = 1; i <= len; i++) {
      temp =
        temp |
        this.sha256ToBigInt(
          sha256((counter | BigInt(noOfBitsToReturn) | BigInt(inputString)).toString()).toString()
        );
      counter += 1n;
    }

    return temp >> BigInt(this._outLength - noOfBitsToReturn);
  }

  private sha256ToBigInt(hash: string): bigint {
    return BigInt('0x' + hash);
  }
}
