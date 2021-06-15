import 'reflect-metadata';
import { Container } from 'inversify';
import { Symbols } from './Symbols';

import { ITwitchHelixClient } from './twitch-data/interfaces/ITwitchHelixClient';
import { TwitchHelixClient } from './twitch-data/TwitchHelixClient';
import { ITwitchStreamService } from './twitch-data/interfaces/ITwitchStreamService';
import { TwitchStreamService } from './twitch-data/TwitchStreamService';
import { IRandomNumberGenerator } from './random/interfaces/IRandomNumberGenerator';
import { RandomNumberGenerator } from './random/RandomNumberGenerator';
import { IInternalState } from './random/interfaces/IInternalState';
import { IPoolState } from './random/interfaces/IPoolState';
import { InternalState } from './random/InternalState';
import { PoolState } from './random/PoolState';

export class Ioc {
  private _container: Container;

  constructor() {
    this._container = this.initialiseInstance();
  }

  private initialiseInstance() {
    const container = new Container();
    container.bind<ITwitchHelixClient>(Symbols.TwitchHelixClient).to(TwitchHelixClient);
    container.bind<ITwitchStreamService>(Symbols.TwitchStreamService).to(TwitchStreamService);
    container.bind<IRandomNumberGenerator>(Symbols.RandomNumberGenerator).to(RandomNumberGenerator);
    container.bind<IInternalState>(Symbols.InternalState).to(InternalState);
    container.bind<IPoolState>(Symbols.PoolState).to(PoolState);

    return container;
  }

  public getInstance(): Container {
    return this._container;
  }
}
