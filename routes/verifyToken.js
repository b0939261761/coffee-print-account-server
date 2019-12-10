import { getDataToken } from '../utils/token.js';

export default (req, res, next) => {
  const data = getDataToken({ token: req.header('Authorization'), type: 'access' });

  if (data) {
    const { roleId } = data;
    const isAdmin = roleId === 1;
    req.user = {
      userId: isAdmin ? 0 : data.userId,
      parentId: isAdmin ? null : 0,
      roleId: isAdmin ? 0 : roleId
    };
    return next();
  }

  return res.status(400).send('ACCESS_TOKEN_INVALID');
};
