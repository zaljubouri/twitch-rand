import { injectable } from 'inversify';
import { EventEmitter } from 'events';

import { IPoolState } from './interfaces/IPoolState';

@injectable()
export class PoolState implements IPoolState {
  private readonly _numberOfPools = 32;

  private _poolStateEmitter: EventEmitter;
  private _poolToSeed!: number;
  private _pools!: bigint[];

  constructor() {
    this._pools = Array(this._numberOfPools).fill(0n);
    this._poolToSeed = 0;
    this._poolStateEmitter = new EventEmitter();
  }

  public getPools(): bigint[] {
    return this._pools;
  }

  public getPoolToSeed(): number {
    return this._poolToSeed;
  }

  public getPoolStateEmitter(): EventEmitter {
    return this._poolStateEmitter;
  }

  public getPoolsForReseeding(reseedCount: number): number[] {
    const poolsForReseeding: number[] = [];

    for (let i = 0; i < this._numberOfPools; i++) {
      if (reseedCount % Math.pow(2, i) === 0) poolsForReseeding.push(i);
    }
    this._poolStateEmitter.emit('getPoolsForReseeding', poolsForReseeding);

    return poolsForReseeding;
  }

  public addToPool(entropy: bigint): void {
    if (this._pools[this._poolToSeed].toString(2).length < 512) {
      this._pools[this._poolToSeed] = BigInt(
        this._pools[this._poolToSeed].toString().concat(entropy.toString())
      );

      this._poolStateEmitter.emit('addToPool', this._pools);
    }

    if (this._poolToSeed === this._numberOfPools - 1) this._poolToSeed = 0;
    else this._poolToSeed += 1;
  }
}
