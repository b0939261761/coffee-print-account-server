import crypto from 'crypto';

const createHash = ({ password, salt }) => crypto
  .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
  .toString('hex');

export const cryptoPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: createHash({ password, salt }) };
};

export const comparePassword = ({ hash, ...credentials }) => createHash(credentials) === hash;

export default {
  cryptoPassword,
  comparePassword
};
