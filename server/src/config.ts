import dotenv from 'dotenv';
dotenv.config();

export default {
  twitchAccount: {
    username: process.env.TWITCHACCOUNT_USERNAME ?? '',
    password: process.env.TWITCHACCOUNT_PASSWORD ?? '',
  },
  twitchApi: {
    clientId: process.env.TWITCHAPI_CLIENTID ?? '',
    clientSecret: process.env.TWITCHAPI_CLIENTSECRET ?? '',
  },
};
