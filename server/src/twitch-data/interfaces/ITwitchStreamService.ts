export interface ITwitchStreamService {
  getChannels(channelsToReturn: number): Promise<string[]>;
}
