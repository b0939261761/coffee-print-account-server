import express from 'express';
import { catchAsyncRoute } from '../utils/tools.js';
import { setStatistic, getStatistic } from '../db/index.js';

const routes = express.Router();

// ---------------------------------------------------------------------------
// -- UPDATE STATISTICS ------------------------------------------------------
// ---------------------------------------------------------------------------

routes.patch('', catchAsyncRoute(async (req, res, next) => {
  if (!req.body.cartridgeId) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!req.body.deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  const statisticOptions = {
    deviceId: req.body.deviceId,
    cartridgeId: req.body.cartridgeId,
    quantityPrinted: req.body.quantityPrinted || 0,
    appVersionCode: req.body.appVersionCode || 0
  };

  const cartridge = await setStatistic(statisticOptions);

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!cartridge.deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  return res.json({
    quantityResource: cartridge.quantityResource,
    quantityPrinted: cartridge.quantityPrinted,
    active: cartridge.active
  });
}));

// -- GET ACTIVATION ------------------------------------------------------

routes.get('', catchAsyncRoute(async (req, res, next) => {
  if (!req.body.code) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!req.body.deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  const statisticOptions = {
    deviceId: req.body.deviceId,
    code: req.body.code,
    appVersionCode: req.body.appVersionCode || 0
  };

  const cartridge = await getStatistic(statisticOptions);

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!cartridge.deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  return res.json({
    id: cartridge.id,
    quantityResource: cartridge.quantityResource,
    quantityPrinted: cartridge.quantityPrinted,
    active: cartridge.active
  });
}));

// -- REPORT ------------------------------------------------------

routes.get('/report', catchAsyncRoute(async (req, res, next) => {
  res.json({ status: true });
}));

// ------------------------------------------------------

export default routes;
