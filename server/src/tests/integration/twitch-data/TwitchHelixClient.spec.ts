import 'reflect-metadata';
import 'chai/register-should';
import { TwitchHelixClient } from '../../../twitch-data/TwitchHelixClient';

describe('TwitchHelixClient', () => {
  let _sut: TwitchHelixClient;

  before(async () => {
    _sut = new TwitchHelixClient();
    await _sut.generateAccessToken();
  });

  describe('#get', () => {
    it('/streams should return 20 channels', async () => {
      const response = await _sut.get('streams', { first: '100' });

      response.status.should.equal(200);
      response.data.data.length.should.equal(100);
    });

    it('/streams after should return next 20 channels', async () => {
      let response = await _sut.get('streams', { first: '100' });
      const firstChannel = response.data.data[0].user_name;
      const cursor = response.data.pagination.cursor;

      response = await _sut.get('streams', { first: '100', after: cursor });
      const twentyFirstChannel = response.data.data[0].user_name;

      response.status.should.equal(200);
      firstChannel.should.not.equal(twentyFirstChannel);
    });
  });
});
