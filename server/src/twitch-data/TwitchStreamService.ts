import { inject, injectable } from 'inversify';
import { ITwitchHelixClient } from './interfaces/ITwitchHelixClient';
import { ITwitchStreamService } from './interfaces/ITwitchStreamService';
import { Symbols } from '../Symbols';

@injectable()
export class TwitchStreamService implements ITwitchStreamService {
  private readonly _twitchHelixClient: ITwitchHelixClient;

  constructor(
    @inject(Symbols.TwitchHelixClient)
    twitchHelixClient: ITwitchHelixClient
  ) {
    this._twitchHelixClient = twitchHelixClient;
  }

  public async getChannels(amountToReturn: number): Promise<string[]> {
    await this._twitchHelixClient.generateAccessToken();
    const channels: string[] = [];
    let streamData = (await this._twitchHelixClient.get('streams', { first: '100' })).data;
    let streams = streamData.data;

    if (!streams || amountToReturn <= 0) return channels;

    if (amountToReturn <= 100) {
      streams.slice(0, amountToReturn).forEach((stream: { user_name: string }) => {
        channels.push(stream.user_name);
      });

      return channels;
    }

    if (amountToReturn > 100) {
      streams.slice(0, 100).forEach((stream: { user_name: string }) => {
        channels.push(stream.user_name);
      });

      const pagesToReturn = Math.floor(amountToReturn / 100);
      let cursor: string = streamData.pagination.cursor;

      for (let i = 0; i < pagesToReturn; i++) {
        streamData = (await this._twitchHelixClient.get('streams', { first: '100', after: cursor }))
          .data;
        streams = streams.concat(streamData.data);
        cursor = streamData.pagination.cursor;
      }

      streams.slice(100, amountToReturn).forEach((stream: { user_name: string }) => {
        channels.push(stream.user_name);
      });

      return channels;
    }

    return channels;
  }
}
