import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Helmet } from 'react-helmet';
import { useAnimation } from 'framer-motion';

import './App.css';
import { PoolProperties } from './types/PoolProperties';
import { Pool } from './components/Pool';
import { InternalState } from './components/InternalState';
import { RandomNumberOutput } from './components/RandomNumberOutput';
import { Arrow } from './components/Arrow';
import { ArrowProperties } from './types/ArrowProperties';
import { InfoTooltip } from './components/InfoTooltip';
import { AppHeader } from './AppHeader';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';
import { About } from './About';
import { Footer } from './Footer';
import { Channels } from './components/Channels';
import { RngApi } from './RngApi';

const queryClient = new QueryClient();

const pools: Record<number, PoolProperties> = {};
const arrows: Record<number, ArrowProperties> = {};

const maxPoolSize = 512;

let socket: WebSocket;
let reconnectionTimeout = 1000;

const App: React.FC = () => {
  const [rng, setRng] = useState('-1');
  const [internalState, setInternalState] = useState({});

  for (let i = 0; i < 32; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const controls = useAnimation();
    pools[i] = { height: 0, controls: controls };
  }
  for (let i = 0; i < 2; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const controls = useAnimation();
    arrows[i] = { controls: controls };
  }

  useEffect(() => {
    connect();
  });

  const connect = () => {
    if (socket && socket.readyState === 1) {
      return;
    }

    const host = process.env.REACT_APP_WEBSOCKET_HOST;
    const port = process.env.REACT_APP_WEBSOCKET_PORT;
    const ssl = Number(process.env.REACT_APP_WEBSOCKET_SSL);

    socket = new WebSocket(`ws${ssl ? 's' : ''}://${host}${port ? ':' + port : ''}`);

    socket.onopen = () => {
      reconnectionTimeout = 1000;
      socket.send('rng');
      socket.send('rngStatus');
    };

    socket.onmessage = (event) => {
      const message = event.data;

      if (message.startsWith('addToPool')) {
        const args = event.data.split(' ');
        const entropyPoolInfo = args[1]
          .split(',')
          .map((x: string) => BigInt(x).toString(2).length / maxPoolSize);

        for (let i = 0; i < entropyPoolInfo.length; i++) {
          pools[i].controls.start(() => ({
            height: Math.floor(entropyPoolInfo[i] * 44),
            transition: { ease: 'easeOut' },
          }));
        }
      }

      if (message.startsWith('reseedingPools')) {
        arrows[0].controls.start(() => ({
          stopColor: 'rgba(0, 170, 255, 0.67)',
        }));
      }

      if (message.startsWith('internalStateUpdate')) {
        const args = event.data.split(' ');
        setInternalState({
          state: args[1],
          value: args[2],
          constant: args[3],
          reseedCounter: args[4] - 1,
          shouldReseedCounter: args[5],
        });
      }

      if (message.startsWith('rng')) {
        const args = event.data.split(' ');
        arrows[1].controls.start(() => ({
          stopColor: '#9147ff',
        }));
        setRng(args[1]);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      console.log('Retrying connection in', reconnectionTimeout / 1000, 's');
      setTimeout(
        () => connect(),
        reconnectionTimeout >= 60 * 1000 ? reconnectionTimeout : (reconnectionTimeout *= 2)
      );
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      socket.close();
    };

    return socket;
  };

  const poolRenderGeneration = () => {
    const poolRenders: any[] = [];
    for (let i = 0; i < Object.keys(pools).length; i++) {
      poolRenders.push(<Pool key={i} id={i} controls={pools[i].controls} />);
    }

    return poolRenders;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Helmet
          defaultTitle="twitch-rand"
          titleTemplate="twitch-rand — %s"
          title="Random powered by Twitch chat"
        />
        <div className="App">
          <AppHeader />
          <main className="App-main">
            <Switch>
              <Route exact path="/">
                <div className="Channels">
                  <Channels />
                </div>
                <div className="Diagram">
                  <div className="Pool-container Diagram-container">
                    <div className="Container-header Pool-header">
                      Pool state{' '}
                      <InfoTooltip
                        tooltipKey="poolState"
                        tooltipText={
                          <>
                            Thirty-two pools which have Twitch chat entropy cyclically added to
                            them.
                            <br />
                            When pool zero is full, it (and sometimes other pools) are emptied to
                            provide entropy to the internal state.
                          </>
                        }
                      />
                    </div>
                    {poolRenderGeneration()}
                  </div>
                  <div className="Arrow-container">
                    <Arrow id={1} controls={arrows[0].controls} />
                  </div>
                  <div className="Internal-state Diagram-container">
                    <InternalState currentInternalState={internalState} />
                  </div>
                  <div className="Arrow-container">
                    <Arrow id={2} controls={arrows[1].controls} />
                  </div>
                  <div className="Random Diagram-container">
                    <RandomNumberOutput currentNumber={rng} />
                  </div>
                </div>
              </Route>
              <Route exact path="/about">
                <About />
              </Route>
              <Route exact path="/rng">
                <RngApi />
              </Route>
              <Route path="*">
                <div style={{ fontSize: '3rem' }}>
                  404 - Go <Link to="/">back</Link>.
                </div>
              </Route>
            </Switch>
          </main>
          <footer className="App-footer">
            <Footer />
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
