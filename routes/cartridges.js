'use strict';

const routes = require('express').Router();
const models = require('../models');

// -- GET ALL ------------------------------------------------------

routes.get('', async (req, res) => {
  const cartridges = await models.Cartridge.findAll({
    order: ['code'],
    attributes: ['id', 'code', 'quantity', 'printed', 'active', 'lastActive', ['lastDeviceId', 'lastDevice']]
  });
  res.json(cartridges);
});

// -- CREATE ------------------------------------------------------

routes.post('', async (req, res, next) => {
  const { quantity, active } = req.body;
  const quantityCartridge = req.body.quantityCartridge || 1;

  const cartridges = [];
  for (let i = 1; i <= quantityCartridge; ++i) {
    // eslint-disable-next-line no-await-in-loop
    const cartridge = await models.Cartridge.create(
      { quantity, active }
    );

    cartridges.push(cartridge.code);
  }

  res.json(cartridges);
});

// -- DELETE ------------------------------------------------------

routes.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  await models.Cartridge.destroy({ where: { id } });
  return res.json({ id });
});

// -- UPDATE STATISTICS ------------------------------------------------------

routes.patch('/statistics/:id', async (req, res, next) => {
  const { id } = req.params;
  const { deviceId, printed = 0 } = req.body;

  const response = await models.Cartridge.update(
    { lastDeviceId: deviceId, printed }, { returning: true, where: { id } }
  );

  const cartridge = response && response[1] && response[1][0];

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));

  return res.json({
    quantity: cartridge.quantity,
    printed: cartridge.printed,
    active: cartridge.active
  });
});

// -- GET ACTIVATION ------------------------------------------------------

routes.get('/activation/:code', async (req, res, next) => {
  const { code } = req.params;

  const cartridge = await models.Cartridge.findOne({
    where: { code },
    attributes: ['id', 'quantity', 'printed', 'active']
  });

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));

  return res.json({
    id: cartridge.id,
    quantity: cartridge.quantity,
    printed: cartridge.printed,
    active: cartridge.active
  });
});

// -- UPDATE ------------------------------------------------------

routes.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { quantity, active } = req.body;

  let result = null;

  if (quantity || active) {
    const cartridge = await models.Cartridge.update(
      { quantity, active }, { returning: true, where: { id } }
    );
    result = cartridge && cartridge[1] && cartridge[1][0];
  } else {
    result = await models.Cartridge.findOne({
      where: { id },
      attributes: ['id', 'code', 'quantity', 'printed', 'active', 'lastActive', 'lastDeviceId']
    });
  }

  if (!result) return next(new Error('WRONG_PARAMS'));

  return res.json({
    id: result.id,
    code: result.code,
    quantity: result.quantity,
    printed: result.printed,
    active: result.active,
    lastActive: result.lastActive,
    lastDevice: result.lastDeviceId
  });
});

module.exports = routes;
