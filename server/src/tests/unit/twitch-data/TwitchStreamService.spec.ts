import 'reflect-metadata';
import 'chai/register-should';
import { It, IMock, Mock } from 'typemoq';
import { ITwitchHelixClient } from '../../../twitch-data/interfaces/ITwitchHelixClient';
import { TwitchHelixResponse } from '../../../twitch-data/models/TwitchHelixResponse';
import { TwitchStreamService } from '../../../twitch-data/TwitchStreamService';

describe('TwitchStreamService', () => {
  let _twitchHelixClientMock: IMock<ITwitchHelixClient>;
  let _sut: TwitchStreamService;
  let _streamNames: string[];
  let _streamData: TwitchHelixResponse;

  const createStreamNames = (amount: number): string[] => {
    const streamers = [];
    for (let i = 0; i < amount; i++) {
      streamers.push(`streamer${i}`);
    }

    return streamers;
  };

  const createStreamData = (streamNames: string[]): Record<string, string>[] => {
    const streamData: Record<string, string>[] = [];
    streamNames.forEach((streamName) => {
      streamData.push({ user_name: streamName });
    });

    return streamData;
  };

  describe('#getChannels', () => {
    before(() => {
      _streamNames = createStreamNames(3);

      _streamData = {
        status: 200,
        data: {
          data: createStreamData(_streamNames),
        },
      };

      _twitchHelixClientMock = Mock.ofType<ITwitchHelixClient>();
      _twitchHelixClientMock
        .setup((x) => x.get(It.isAnyString(), { first: '100' }))
        .returns(async () => _streamData);

      _sut = new TwitchStreamService(_twitchHelixClientMock.object);
    });

    it('should return no channels if requested amount is negative', async () => {
      const channels = await _sut.getChannels(-1);

      channels.should.have.lengthOf(0);
    });

    it('should return 3 channels', async () => {
      const channels = await _sut.getChannels(3);

      channels.should.have.lengthOf(3);
      channels.should.contain.all.members(_streamNames.slice(0, 3));
    });

    it('should return 20 channels', async () => {
      _streamNames = createStreamNames(20);
      _streamData = {
        status: 200,
        data: {
          data: createStreamData(_streamNames),
        },
      };
      _twitchHelixClientMock
        .setup((x) => x.get(It.isAnyString(), { first: '100' }))
        .returns(async () => _streamData);
      const channels = await _sut.getChannels(20);

      channels.should.have.lengthOf(20);
      channels.should.contain.all.members(_streamNames);
    });

    it('should return 21 channels', async () => {
      _streamNames = createStreamNames(101);
      const _streamDataPageOne = {
        status: 200,
        data: {
          data: createStreamData(_streamNames).slice(0, 100),
          pagination: {
            cursor: 'test',
          },
        },
      };
      const _streamDataPageTwo = {
        status: 200,
        data: {
          data: createStreamData(_streamNames).slice(100, 101),
          pagination: {
            cursor: 'test',
          },
        },
      };

      _twitchHelixClientMock
        .setup((x) => x.get(It.isAnyString(), { first: '100' }))
        .returns(async () => _streamDataPageOne);
      _twitchHelixClientMock
        .setup((x) =>
          x.get(It.isAnyString(), {
            first: '100',
            after: _streamDataPageOne.data.pagination.cursor,
          })
        )
        .returns(async () => _streamDataPageTwo);

      const channels = await _sut.getChannels(101);

      channels.should.have.lengthOf(101);
      channels.should.contain.all.members(_streamNames);
    });

    it('should return 55 channels', async () => {
      _streamNames = createStreamNames(215);
      const _streamDataPageOne = {
        status: 200,
        data: {
          data: createStreamData(_streamNames).slice(0, 100),
          pagination: {
            cursor: 'test',
          },
        },
      };
      const _streamDataPageTwo = {
        status: 200,
        data: {
          data: createStreamData(_streamNames).slice(100, 200),
          pagination: {
            cursor: 'test',
          },
        },
      };
      const _streamDataPageThree = {
        status: 200,
        data: {
          data: createStreamData(_streamNames).slice(200, 215),
          pagination: {
            cursor: 'test',
          },
        },
      };

      _twitchHelixClientMock
        .setup((x) => x.get(It.isAnyString(), { first: '100' }))
        .returns(async () => _streamDataPageOne);
      _twitchHelixClientMock
        .setup((x) =>
          x.get(It.isAnyString(), {
            first: '100',
            after: _streamDataPageOne.data.pagination.cursor,
          })
        )
        .returns(async () => _streamDataPageTwo);
      _twitchHelixClientMock
        .setup((x) =>
          x.get(It.isAnyString(), {
            first: '100',
            after: _streamDataPageTwo.data.pagination.cursor,
          })
        )
        .returns(async () => _streamDataPageThree);

      const channels = await _sut.getChannels(215);

      channels.should.have.lengthOf(215);
      channels.should.contain.all.members(_streamNames);
    });
  });
});
