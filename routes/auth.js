import express from 'express';
import { catchAsyncRoute } from '../utils/tools.js';
import { comparePassword } from '../utils/password.js';
import { createTokens, getDataToken } from '../utils/token.js';
import verifyToken from './verifyToken.js';
import { getUserById, getUserByEmail, setUserToken } from '../db/index.js';

const routes = express.Router();

// ---------------------------

const generateHeaders = async ({ userId, roleId }) => {
  const { accessToken, refreshToken } = createTokens({ userId, roleId });
  if (!await setUserToken({ userId, token: refreshToken })) return false;
  return { 'Access-Token': accessToken, 'Refresh-Token': refreshToken };
};

// ---------------------------

const sendHeaders = async ({ user, res }) => {
  const headers = await generateHeaders(user);
  if (!headers) return false;
  res.set(headers).sendStatus(204);
  return true;
};

// -- GET ALL ----------------------------------------------------------------

routes.post('/login', catchAsyncRoute(async (req, res) => {
  const { email, password } = req.body;
  const user = await getUserByEmail(email);

  if (!user
    || !comparePassword({ password, salt: user.salt, hash: user.hash })
    || !await sendHeaders({ user, res })) res.status('400').send('FAIL_AUTH');
}));

// -- LOGOUT -------------------------------------------------------------

routes.post('/logout', verifyToken, catchAsyncRoute(async (req, res) => {
  await setUserToken({ userId: req.user.userId, token: '' });
  res.sendStatus('204');
}));

// -- TOKEN ----------------------------------------------------------------

routes.get('/token', catchAsyncRoute(async (req, res) => {
  const dataToken = getDataToken({ token: req.header('Authorization'), type: 'refresh' });
  const user = dataToken && await getUserById(dataToken.userId);

  if (!user || user.token !== dataToken.token || !await sendHeaders({ user, res })) {
    res.status('400').send('REFRESH_TOKEN_INVALID');
  }
}));

// ---------------------------

export default routes;
