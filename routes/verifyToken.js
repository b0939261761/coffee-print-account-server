const { getDataToken } = require('../utils/token');

module.exports = (req, res, next) => {
  const data = getDataToken({ token: req.header('Authorization'), type: 'access' });

  if (data) {
    const { roleId } = data;

    req.roleId = roleId;
    req.isAdmin = roleId === 1;
    req.userId = req.isAdmin ? 0 : data.userId;
    req.parentId = req.isAdmin ? 'NULL' : 0;
    return next();
  }

  return res.status(400).send('ACCESS_TOKEN_INVALID');
};
