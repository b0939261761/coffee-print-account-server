const crypto = require('crypto');

const createHash = ({ password, salt }) => crypto
  .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
  .toString('hex');

const cryptoPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: createHash({ password, salt }) };
};

const comparePassword = ({ password, salt, hash }) => createHash({ password, salt }) === hash;

module.exports = {
  cryptoPassword,
  comparePassword
};
