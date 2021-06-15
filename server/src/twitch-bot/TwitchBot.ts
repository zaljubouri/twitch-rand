import tmi, { Client } from 'tmi.js';

export class TwitchBot {
  private readonly _username: string;
  private readonly _password: string;
  private readonly _channels: string[];

  private _twitchClient!: Client;

  constructor(username: string, password: string, channels: string[]) {
    this._username = username;
    this._password = password;
    this._channels = channels;

    this.initialiseTwitchClient();
  }

  private initialiseTwitchClient() {
    const opts = {
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: this._username,
        password: this._password,
      },
      channels: this._channels,
    };

    this._twitchClient = tmi.Client(opts);
  }

  public getTwitchBotClient(): Client {
    return this._twitchClient;
  }

  public getConnectedChannels(): string[] {
    return this._channels;
  }
}
