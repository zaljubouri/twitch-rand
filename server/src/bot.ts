import dayjs from 'dayjs';
import uWS from 'uWebSockets.js';
import path from 'path';
import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

import { TwitchBot } from './twitch-bot/TwitchBot';
import config from './config';
import { ITwitchStreamService } from './twitch-data/interfaces/ITwitchStreamService';
import { Ioc } from './Ioc';
import { Symbols } from './Symbols';
import { Client as TwitchBotClient } from 'tmi.js';
import { IRandomNumberGenerator } from './random/interfaces/IRandomNumberGenerator';

const ioc = new Ioc().getInstance();

const streamApiClient = ioc.get<ITwitchStreamService>(Symbols.TwitchStreamService);
const expressRng = ioc.get<IRandomNumberGenerator>(Symbols.RandomNumberGenerator);

const wsPort = Number(process.env.WSPORT) || 8081;
const expressPort = Number(process.env.EXPRESSPORT) || 8080;

const streamerNextTimes: Record<string, [boolean, number]> = {};
const utf8decoder = new TextDecoder();

const wsClients: Record<number, [uWS.WebSocket, IRandomNumberGenerator]> = {};

let id = 0;
let messagesSent = 0;

let client: TwitchBot;

async function main() {
  await startTwitchBot();
  startExpress();
  startUws();
}

const startTwitchBot = async () => {
  const channels = await streamApiClient.getChannels(100);

  channels.forEach((channel) => {
    streamerNextTimes[`#${channel.toLowerCase()}`] = [true, 0];
  });

  client = new TwitchBot(config.twitchAccount.username, config.twitchAccount.password, channels);

  const twitchBotClient: TwitchBotClient = client.getTwitchBotClient();

  twitchBotClient.on('connected', onConnected);
  twitchBotClient.on('message', onMessage);

  twitchBotClient.connect();
};

const startUws = async () => {
  uWS
    .App()
    .ws('/*', {
      idleTimeout: 60 * (Math.random() * (32 - 28) + 28),
      maxBackpressure: 1024,
      maxPayloadLength: 16 * 1024,
      compression: uWS.SHARED_COMPRESSOR,

      open: (ws) => {
        console.log('Client has connected.');
        wsClients[id++] = [ws, ioc.get<IRandomNumberGenerator>(Symbols.RandomNumberGenerator)];
        ws.send(`channels: ${client.getConnectedChannels().join(',')}`);
      },
      message: (ws, message, isBinary) => {
        const decodedMessage = utf8decoder.decode(message);
        let wsKey: any;
        Object.keys(wsClients).forEach((key) => {
          if (ws == wsClients[Number(key)][0]) {
            wsKey = Number(key);
          }
        });
        const randomNumberGenerator: IRandomNumberGenerator = wsClients[wsKey][1];

        const poolListener = randomNumberGenerator.getPoolState().getPoolStateEmitter();
        const internalStateListener = randomNumberGenerator
          .getInternalState()
          .getInternalStateEmitter();
        const sendAddPoolMessage = async (pools: bigint[]) => {
          try {
            ws.send(`addToPool: ${pools}`, isBinary);
            messagesSent++;
          } catch (err) {
            console.error('Client has disconnected.');
            poolListener.removeListener('addToPool', sendAddPoolMessage);
            return;
          }
        };
        const sendReseedingPools = async (poolsForReseeding: number[]) => {
          try {
            ws.send(`reseedingPools: ${poolsForReseeding}`, isBinary);
            messagesSent++;
          } catch (err) {
            console.error('Client has disconnected.');
            poolListener.removeListener('getPoolsForReseeding', sendReseedingPools);
            return;
          }
        };
        const sendInternalStateUpdate = async (
          state: string,
          value: bigint,
          constant: bigint,
          reseedCounter: number,
          shouldReseedCounter: bigint
        ) => {
          try {
            ws.send(
              `internalStateUpdate: ${state} ${value.toString(16)} ${constant.toString(
                16
              )} ${reseedCounter} ${shouldReseedCounter.toString(10)}`,
              isBinary
            );
            messagesSent++;
          } catch (err) {
            console.error('Client has disconnected.');
            internalStateListener.removeListener('internalStateUpdate', sendInternalStateUpdate);
            return;
          }
        };

        if (decodedMessage == 'rngStatus') {
          poolListener.on('addToPool', sendAddPoolMessage);
          poolListener.on('getPoolsForReseeding', sendReseedingPools);
          internalStateListener.on('internalStateUpdate', sendInternalStateUpdate);
        }

        if (decodedMessage == 'rng') {
          const interval = setInterval(() => {
            if (randomNumberGenerator.getInternalState().getState() == 'SEEDED') {
              try {
                ws.send(
                  `rng: ${randomNumberGenerator.generateRandomNumber(32).toString(10)}`,
                  isBinary
                );
                messagesSent++;
              } catch (err) {
                console.error('Client has disconnected.');
                clearInterval(interval);
                return;
              }
            }
          }, 1000);
        }
      },
      drain: (ws) => {},
      close: (ws, code, message) => {
        Object.keys(wsClients).forEach((key) => {
          if (ws == wsClients[Number(key)][0]) {
            delete wsClients[Number(key)];
          }
        });
      },
    })
    .any('/*', (res, req) => {
      res.end('Nothing to see here.');
    })
    .listen(wsPort, (token) => {
      if (token) {
        console.log(`WebSocket server listening on ${wsPort}`);
        const serverStartTime = dayjs().unix();
        setInterval(() => {
          console.log('Messages sent:', messagesSent);
          console.log('Messages per second:', messagesSent / (dayjs().unix() - serverStartTime));
          console.log('Clients connected:', Object.keys(wsClients));
          console.log('Number of clients connected:', Object.keys(wsClients).length);
        }, 60 * 1000);
      } else {
        console.log(`Failed to listen to port ${wsPort}`);
      }
    });
};

const startExpress = async () => {
  const app = express();

  app.use(express.static(path.join(__dirname, '../../client-app/build')));
  app.use(cors());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 10000,
      message: 'Request limit exceeded: this API supports 10,000 requests per minute.',
    })
  );

  app.get('/random', (req, res) => {
    try {
      if (expressRng.getInternalState().getState() == 'UNSEEDED') res.status(200).send(false);
      else {
        const bits = req.query.bits ? Number(req.query.bits) : 32;
        const max = req.query.max ? BigInt(req.query.max) : 2n ** BigInt(bits);
        const min = req.query.min ? BigInt(req.query.min) : 0n;

        if (max <= min)
          throw RangeError(`Max (${max}) cannot be less than or equal to the min (${min}).`);
        if (min >= max)
          throw RangeError(`Min (${min}) cannot be greater than or equal to the max (${max}).`);
        if (max > 2n ** BigInt(bits))
          throw RangeError(`Max (${max}) cannot be greater than 2^${bits}: ${2 ** bits}.`);

        res.send(((expressRng.generateRandomNumber(bits) % (max - min + 1n)) + min).toString(10));
      }
    } catch (err) {
      res.status(400).send(`There was an issue with your request: ${err.message}`);
      console.log(err);
    }
  });

  app.get('/channels', (req, res) => {
    try {
      res.send(client.getConnectedChannels());
    } catch (err) {
      res.status(500).send('There was an issue retrieving channel information.');
      console.log(err);
    }
  });

  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client-app/build', 'index.html'));
  });

  app.listen(expressPort, () => console.log(`Express server listening on ${expressPort}`));
};

const onConnected = (addr: string, port: number) => {
  console.log(`addr: ${addr}; port: ${port}`);
  console.log(`Current time is ${dayjs().toISOString()}`);
};

const onMessage = async (channel: string, tags: any, message: string, self: boolean) => {
  if (streamerNextTimes[channel][0]) {
    streamerNextTimes[channel][1] = dayjs().valueOf();
    streamerNextTimes[channel][0] = false;
  } else {
    const nextTime = dayjs().valueOf();
    Object.keys(wsClients).forEach((key) =>
      wsClients[Number(key)][1].addToPool(BigInt(nextTime - streamerNextTimes[channel][1]))
    );
    expressRng.addToPool(BigInt(nextTime - streamerNextTimes[channel][1]));
    streamerNextTimes[channel][1] = nextTime;
  }
};

main();
