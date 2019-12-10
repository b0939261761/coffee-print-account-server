import express from 'express';
import { catchAsyncRoute } from '../utils/tools.js';
import { getCartridges, getCartridge, setCartridge } from '../db/index.js';

const routes = express.Router();

// -- GET ALL ----------------------------------------------------------------

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getCartridges(req.user))));

// -- UPDATE ------------------------------------------------------

routes.patch('/:cartridgeId', catchAsyncRoute(async (req, res, next) => {
  const cartridgeOptions = {
    cartridgeId: req.params.cartridgeId,
    quantityResource: req.body.quantityResource,
    active: req.body.active,
    userId: req.body.userId
  };

  const cartridge = await setCartridge({ user: req.user, cartridge: cartridgeOptions });
  if (!cartridge) return next(new Error('WRONG_PARAMS'));
  return res.json(cartridge);
}));

// -- GET ID ------------------------------------------------------

routes.get('/:cartridgeId', catchAsyncRoute(async (req, res, next) => {
  const { cartridgeId } = req.params;
  const cartridge = await getCartridge({ user: req.user, cartridgeId });
  if (!cartridge) return next(new Error('WRONG_PARAMS'));
  return res.json(cartridge);
}));

// -----------------------------------

export default routes;
