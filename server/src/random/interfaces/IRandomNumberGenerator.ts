import { IInternalState } from './IInternalState';
import { IPoolState } from './IPoolState';

export interface IRandomNumberGenerator {
  getPoolState(): IPoolState;
  getInternalState(): IInternalState;
  addToPool(entropy: bigint): void;
  generateRandomNumber(max: number): bigint;
}
