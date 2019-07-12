'use strict';

const defaultValue = {
  username: process.env.ACCOUNT_SERVER_POSTGRES_USER,
  password: process.env.ACCOUNT_SERVER_POSTGRES_PASSWORD,
  database: process.env.ACCOUNT_SERVER_POSTGRES_DB,
  host: process.env.ACCOUNT_SERVER_POSTGRES_HOST,
  port: process.env.ACCOUNT_SERVER_POSTGRES_PORT,
  dialect: 'postgres'
};

module.exports = {
  development: {
    ...defaultValue,
    logging: console.info
  },
  test: {
    ...defaultValue
  },
  production: {
    ...defaultValue
  }
};
