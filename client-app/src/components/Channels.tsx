import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';

const useChannels = () => {
  let url = '/channels';
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;

  if (host) url = `http://${host}:${port}${url}`;

  return useQuery(
    'channels',
    async () => {
      return await axios.get(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    },
    {
      refetchInterval: 1000 * 300,
      staleTime: 1000 * 300,
      retry: true,
    }
  );
};

export const Channels: React.FC = () => {
  const [channels, setChannels] = useState([]);
  const [currentChannels, setCurrentChannels] = useState('. . .');

  const { data } = useChannels();

  useEffect(() => {
    if (data) setChannels(data.data);

    const interval = setInterval(() => {
      if (channels.length !== 0) {
        let randomChannels: string[] = [];
        for (let i = 0; i < 5; i++) {
          let randomIndex = Math.floor(Math.random() * channels.length);
          while (randomChannels.includes(channels[randomIndex]))
            randomIndex = Math.floor(Math.random() * channels.length);

          randomChannels.push(channels[randomIndex]);
        }
        setCurrentChannels(randomChannels.join(' '));
      }
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [data, channels]);

  return (
    <>
      <b>Connected to {channels.length} channels</b>
      <br />
      {currentChannels}
    </>
  );
};
