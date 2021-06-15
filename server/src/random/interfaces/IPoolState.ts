import { EventEmitter } from 'events';

export interface IPoolState {
  getPools(): bigint[];
  getPoolToSeed(): number;
  getPoolStateEmitter(): EventEmitter;
  getPoolsForReseeding(reseedCount: number): number[];
  addToPool(entropy: bigint): void;
}
