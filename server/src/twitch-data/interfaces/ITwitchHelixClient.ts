import { TwitchHelixResponse } from '../models/TwitchHelixResponse';

export interface ITwitchHelixClient {
  generateAccessToken(): Promise<void>;
  get(endpoint: string, queryParams?: Record<string, string>): Promise<TwitchHelixResponse>;
  post(endpoint: string, data?: Record<string, string>): Promise<TwitchHelixResponse>;
}
