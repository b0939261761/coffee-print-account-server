const routes = require('express').Router();
const { comparePassword } = require('../utils/password');
const { createTokens, getDataToken } = require('../utils/token');
const { sequelize } = require('../models');
const verifyToken = require('./verifyToken');

const updateToken = async ({ userId, token }) => {
  const sql = `UPDATE "Users" SET token = '${token}' WHERE id = ${userId} RETURNING id`;
  const { 0: response } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
  return response;
};

const generateHeaders = async ({ userId, roleId }) => {
  const { accessToken, refreshToken } = createTokens({ userId, roleId });

  if (!await updateToken({ userId, token: refreshToken })) return false;
  return { 'Access-Token': accessToken, 'Refresh-Token': refreshToken };
};

// -- GET ALL ----------------------------------------------------------------

routes.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT id AS "userId", salt, hash, "roleId"
      FROM "Users"
      WHERE email = '${username}'
  `;

  const { 0: user } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (user && comparePassword({ password, salt: user.salt, hash: user.hash })) {
    const headers = await generateHeaders(user);
    if (headers) return res.set(headers).sendStatus(204);
  }

  return res.status('400').send('FAIL_AUTH');
});

// -- LOGOUT -------------------------------------------------------------

routes.post('/logout', verifyToken, async (req, res) => {
  await updateToken({ userId: req.userId, token: '' });
  return res.sendStatus('204');
});

// -- TOKEN ----------------------------------------------------------------

routes.get('/token', async (req, res) => {
  const dataToken = getDataToken({ token: req.header('Authorization'), type: 'refresh' });

  if (dataToken) {
    const sql = `
      SELECT id AS "userId", token, "roleId"
        FROM "Users"
        WHERE id = '${dataToken.userId}'
    `;

    const { 0: user } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
    if (user && user.token === dataToken.token) {
      const headers = await generateHeaders(user);
      if (headers) return res.set(headers).sendStatus(204);
    }
  }

  return res.status('400').send('REFRESH_TOKEN_INVALID');
});


module.exports = routes;
