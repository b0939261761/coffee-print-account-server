import express from 'express';
import { catchAsyncRoute } from '../utils/tools.js';
import { cryptoPassword } from '../utils/password.js';
import db from '../db/index.js';

const routes = express.Router();

// -- GET ALL ----------------------------------------------------------------

routes.get('', catchAsyncRoute(async (req, res) => res.json(await db.getUsers(req.user))));

// -- CREATE ------------------------------------------------------

routes.post('', catchAsyncRoute(async (req, res, next) => {
  const userOptions = {
    email: req.body.email,
    roleId: req.body.roleId,
    parentId: req.body.roleId === 1 ? null : req.body.parentId,
    ...cryptoPassword(req.body.password)
  };

  const user = await db.addUser({ user: req.user, userOptions });
  if (!user) return next(new Error('WRONG_PARAMS'));
  return res.json(user);
}));

// -- UPDATE ------------------------------------------------------

routes.patch('/:userId', catchAsyncRoute(async (req, res, next) => {
  const userOptions = {
    userId: req.params.userId,
    email: req.body.email,
    ...cryptoPassword(req.body.password)
  };

  const user = await db.setUser({ user: req.user, userOptions });
  if (!user) return next(new Error('WRONG_PARAMS'));
  return res.json(user);
}));

// -- LIST ------------------------------------------------------

routes.get('/list', catchAsyncRoute(async (req, res) => res.json(
  await db.getUserList({ user: req.user, minRoleId: req.query.roleId - 1 })
)));

// -- CHILDREN ------------------------------------------------------

routes.get('/children', catchAsyncRoute(async (req, res) => res.json(
  await db.getUserChildren(req.user)
)));

// -- GET USER ------------------------------------------------------

routes.get('/:userId', catchAsyncRoute(async (req, res, next) => {
  const user = await db.getUser({ user: req.user, userId: req.params.userId });
  if (!user) return next(new Error('WRONG_PARAMS'));
  return res.json(user);
}));

// --------------------------------------------------------

export default routes;
