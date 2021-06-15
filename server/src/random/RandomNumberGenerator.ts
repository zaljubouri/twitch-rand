import { inject, injectable } from 'inversify';
import { Symbols } from '../Symbols';
import { IInternalState } from './interfaces/IInternalState';
import { IPoolState } from './interfaces/IPoolState';
import { IRandomNumberGenerator } from './interfaces/IRandomNumberGenerator';

@injectable()
export class RandomNumberGenerator implements IRandomNumberGenerator {
  private readonly _minimumEntropyLength = 256;
  private readonly _reseedInterval = Math.pow(2, 16);

  private readonly _internalState: IInternalState;
  private readonly _poolState: IPoolState;

  private _nonce = 1n;

  constructor(
    @inject(Symbols.InternalState) internalState: IInternalState,
    @inject(Symbols.PoolState) poolState: IPoolState
  ) {
    this._internalState = internalState;
    this._poolState = poolState;
  }

  public addToPool(entropy: bigint): void {
    this._poolState.addToPool(entropy);

    if (this._poolState.getPoolToSeed() === 0 || this._internalState.getState() == 'UNSEEDED') {
      const pools = this._poolState.getPools();

      if (pools[0].toString(2).length >= this._minimumEntropyLength) {
        if (this._internalState.getState() == 'UNSEEDED') {
          this._internalState.seed(entropy | this._nonce);
          this._nonce += 1n;
        } else {
          this.reseed();
        }
      }
    }
  }

  public getPoolState(): IPoolState {
    return this._poolState;
  }

  public getInternalState(): IInternalState {
    return this._internalState;
  }

  public generateRandomNumber(max = 32): bigint {
    if (this._internalState.getState() == 'UNSEEDED') {
      console.error('Generator is still unseeded; cannot provide random numbers');
      return -1n;
    }

    if (Number(this._internalState.getShouldReseedCounter()) > this._reseedInterval) {
      this._internalState.setState('UNSEEDED');

      const waitForEntropy = () => {
        if (this._poolState.getPools()[0].toString(2).length < this._minimumEntropyLength) {
          setImmediate(() => waitForEntropy());
        } else {
          this.reseed();
        }
      };
      waitForEntropy();
    }

    return this._internalState.generate(max);
  }

  private reseed(): void {
    const currentReseedCounter = this._internalState.getReseedCounter();
    const poolsForSeeding = this._poolState.getPoolsForReseeding(currentReseedCounter);

    let sum = 0n;

    poolsForSeeding.forEach((poolIndex) => {
      sum += this._poolState.getPools()[poolIndex];
      this._poolState.getPools()[poolIndex] = 0n;
    });

    this._internalState.reseed(sum);
  }
}
