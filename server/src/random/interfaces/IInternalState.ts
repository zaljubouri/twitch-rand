import { EventEmitter } from 'events';

export interface IInternalState {
  getState(): string;
  getReseedCounter(): number;
  getShouldReseedCounter(): bigint;
  getInternalStateEmitter(): EventEmitter;
  setState(newState: string): void;
  seed(seedMaterial: bigint): void;
  reseed(entropyInput: bigint): void;
  generate(outputLength: number): bigint;
}
