import axios, { AxiosInstance } from 'axios';
import { injectable } from 'inversify';
import { ITwitchHelixClient } from './interfaces/ITwitchHelixClient';
import { TwitchHelixResponse } from './models/TwitchHelixResponse';
import config from '../config';

@injectable()
export class TwitchHelixClient implements ITwitchHelixClient {
  private readonly _clientId: string;
  private readonly _clientSecret: string;

  private _accessToken = '';
  private _axios: AxiosInstance;

  constructor() {
    this._clientId = config.twitchApi.clientId;
    this._clientSecret = config.twitchApi.clientSecret;
    this._axios = axios.create({ baseURL: 'https://api.twitch.tv/helix/' });
  }

  public async generateAccessToken(): Promise<void> {
    try {
      const response = await axios.post(
        `https://id.twitch.tv/oauth2/token?client_id=${this._clientId}&client_secret=${this._clientSecret}&grant_type=client_credentials`
      );

      this._accessToken = response.data.access_token;
    } catch (error) {
      console.error(error.toJSON());
    }

    this._axios.defaults.headers = {
      Authorization: `Bearer ${this._accessToken}`,
      'client-id': this._clientId,
    };
  }

  public async get(
    endpoint: string,
    queryParams?: Record<string, string>
  ): Promise<TwitchHelixResponse> {
    if (endpoint.startsWith('/')) endpoint = endpoint.substr(1);
    if (queryParams) {
      endpoint = endpoint.concat('?');
      Object.keys(queryParams).forEach((key, i) => {
        endpoint =
          i === 0
            ? endpoint.concat(`${key}=${queryParams[key]}`)
            : endpoint.concat(`&${key}=${queryParams[key]}`);
      });
    }

    try {
      const response = await this._axios.get(endpoint);
      const twitchHelixResponse: TwitchHelixResponse = {
        status: response.status,
        data: response.data,
      };

      return twitchHelixResponse;
    } catch (error) {
      console.error(error.toJSON());

      return { status: 503, data: null };
    }
  }

  public async post(endpoint: string, data?: Record<string, string>): Promise<TwitchHelixResponse> {
    if (endpoint.startsWith('/')) endpoint = endpoint.substr(1);

    try {
      const response = await this._axios.post(endpoint, data);
      const twitchHelixResponse: TwitchHelixResponse = {
        status: response.status,
        data: response.data,
      };

      return twitchHelixResponse;
    } catch (error) {
      console.error(error.toJSON());

      return { status: 503, data: null };
    }
  }
}
