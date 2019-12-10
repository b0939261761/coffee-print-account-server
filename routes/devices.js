import express from 'express';
import { catchAsyncRoute } from '../utils/tools.js';
import { getDevices, getDevice, setDevice } from '../db/index.js';

const routes = express.Router();

// -- GET ALL ----------------------------------------------------------------

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getDevices(req.user))));

// -- GET ID ------------------------------------------------------

routes.get('/:deviceId', catchAsyncRoute(async (req, res, next) => {
  const { deviceId } = req.params;
  const device = await getDevice({ user: req.user, deviceId });
  if (!device) return next(new Error('WRONG_PARAMS'));
  return res.json(device);
}));


// -- UPDATE ------------------------------------------------------

routes.patch('/:deviceId', catchAsyncRoute(async (req, res, next) => {
  const deviceOptions = {
    deviceId: req.params.deviceId,
    city: req.body.city,
    description: req.body.description,
    userId: req.body.userId
  };

  const device = await setDevice({ user: req.user, device: deviceOptions });
  if (!device) return next(new Error('WRONG_PARAMS'));
  return res.json(device);
}));

export default routes;
