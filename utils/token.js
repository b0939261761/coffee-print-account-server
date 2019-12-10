import jwt from 'jsonwebtoken';

const ACCESS_EXP = 60 * 60;
const REFRESH_EXP = 24 * 60 * 60;

const secret = process.env.ACCOUNT_SERVER_JWT;

const createExp = exp => Math.floor(new Date().getTime() / 1000) + exp;

const tokenTrim = token => token && (token.startsWith('Bearer ') ? token.slice(7, token.length) : token);

const createToken = data => jwt.sign(data, secret);

const createAccessToken = user => createToken({
  ...user, type: 'access', exp: createExp(ACCESS_EXP)
});

const createRefreshToken = ({ userId }) => createToken({
  userId, type: 'refresh', exp: createExp(REFRESH_EXP)
});

export const createTokens = user => ({
  accessToken: createAccessToken(user),
  refreshToken: createRefreshToken(user)
});

export const getDataToken = ({ token: tokenTmp, type }) => {
  const token = tokenTrim(tokenTmp);
  try {
    const data = jwt.verify(token, secret);
    if (data.type === type) return { ...data, token };
  } catch { }
  return false;
};

export default {
  createTokens,
  getDataToken
};
