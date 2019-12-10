const dotenv = require('dotenv');

const env = process.env.NODE_ENV;
if (env !== 'production') dotenv.config();

module.exports = {
  client: 'postgresql',
  connection: {
    host: process.env.ACCOUNT_SERVER_POSTGRES_HOST,
    port: process.env.ACCOUNT_SERVER_POSTGRES_PORT,
    database: process.env.ACCOUNT_SERVER_POSTGRES_DB,
    user: process.env.ACCOUNT_SERVER_POSTGRES_USER,
    password: process.env.ACCOUNT_SERVER_POSTGRES_PASSWORD
  }
};

// import './config.js';

// export default {
//   client: 'postgresql',
//   connection: {
//     host: process.env.ACCOUNT_SERVER_POSTGRES_HOST,
//     port: process.env.ACCOUNT_SERVER_POSTGRES_PORT,
//     database: process.env.ACCOUNT_SERVER_POSTGRES_DB,
//     user: process.env.ACCOUNT_SERVER_POSTGRES_USER,
//     password: process.env.ACCOUNT_SERVER_POSTGRES_PASSWORD
//   }
// };
