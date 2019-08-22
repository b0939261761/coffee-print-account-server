const routes = require('express').Router();
const { sequelize } = require('../models');

// ---------------------------------------------------------------------------
// -- UPDATE STATISTICS ------------------------------------------------------
// ---------------------------------------------------------------------------

routes.patch('/statistics', async (req, res, next) => {
  const {
    deviceId, cartridgeId, quantityPrinted = 0, appVersionCode = ''
  } = req.body;

  if (!cartridgeId) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  const sql = `
    WITH
      device("deviceId") AS (
        UPDATE "Devices" SET "appVersionCode" = ${appVersionCode}
          WHERE id = ${deviceId} RETURNING id AS "deviceId"
      ),
      cartridge("cartridgeId") AS (
        SELECT id AS cartridgeId FROM "Cartridges"
          WHERE id = ${cartridgeId}
      ),
      statistic(id, "cartridgeId", "quantityPrinted") AS (
        INSERT INTO "Statistics" ("deviceId", "cartridgeId", "quantityPrinted")
          SELECT "deviceId", "cartridgeId", ${quantityPrinted} FROM cartridge
            CROSS JOIN device
          ON CONFLICT ("deviceId", "cartridgeId")
            DO UPDATE SET "quantityPrinted" = EXCLUDED."quantityPrinted"
          RETURNING id, "cartridgeId", "quantityPrinted"
      )
    SELECT
        "Cartridges".active,
        "Cartridges"."quantityResource",
        SUM(bb."quantityPrinted") OVER() AS "quantityPrinted",
        (SELECT "deviceId" FROM device) AS "deviceId"
      FROM "Cartridges"
      CROSS JOIN (
        SELECT id, "cartridgeId", "quantityPrinted" FROM "Statistics"
          WHERE "Statistics"."cartridgeId" = (SELECT "cartridgeId" FROM statistic)
            AND "Statistics".id != (SELECT id FROM statistic)
        UNION ALL
        SELECT id, "cartridgeId", "quantityPrinted" FROM statistic
      ) bb
      WHERE "Cartridges".id = (SELECT "cartridgeId" FROM statistic)
      LIMIT 1
  `;

  const { 0: cartridge } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!cartridge.deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  return res.json({
    quantityResource: cartridge.quantityResource,
    quantityPrinted: +cartridge.quantityPrinted,
    active: cartridge.active
  });
});

// -- GET ACTIVATION ------------------------------------------------------

routes.patch('/activation', async (req, res, next) => {
  const { code, deviceId, appVersionCode = '' } = req.body;

  if (!code) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  const sql = `
    WITH
      device("deviceId") AS (
        UPDATE "Devices" SET "appVersionCode" = ${appVersionCode}
          WHERE id = ${deviceId} RETURNING id AS "deviceId"
      ),
      cartridge AS (
        SELECT
            "Cartridges".id,
            "Cartridges".active,
            "Cartridges"."quantityResource",
            SUM("Statistics"."quantityPrinted") OVER() AS "quantityPrinted"
          FROM "Cartridges"
          LEFT JOIN "Statistics" ON "Cartridges".id = "Statistics"."cartridgeId"
          WHERE "Cartridges".code = '${code}'
          LIMIT 1
      ),
      statistic AS (
        INSERT INTO "Statistics" ("deviceId", "cartridgeId")
        SELECT "deviceId", id FROM cartridge CROSS JOIN device
          ON CONFLICT ("deviceId", "cartridgeId") DO NOTHING
      )
      SELECT *, (SELECT "deviceId" FROM device) AS "deviceId" FROM cartridge
  `;

  const { 0: cartridge } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!cartridge.deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  return res.json({
    id: cartridge.id,
    quantityResource: cartridge.quantityResource,
    quantityPrinted: cartridge.quantityPrinted,
    active: cartridge.active
  });
});

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

// -- GET ALL ----------------------------------------------------------------

routes.get('', async (req, res) => {
  const sql = `
    SELECT
      "Cartridges".id,
      "Cartridges".code,
      "Cartridges".active,
      "Cartridges"."quantityResource",
      COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
      JSONB_AGG(
        JSON_BUILD_OBJECT(
          'quantityPrinted', "Statistics"."quantityPrinted",
          'deviceCode', "Devices".code,
          'deviceCity', "Devices".city,
          'deviceDescription', "Devices"."description",
          'lastActive', "Statistics"."lastActive"
        ) ORDER BY "Statistics"."lastActive" DESC
      ) AS devices
    FROM "Cartridges"
    LEFT JOIN "Statistics" ON "Cartridges".id = "Statistics"."cartridgeId"
    LEFT JOIN "Devices" ON "Statistics"."deviceId" = "Devices"."id"
    GROUP BY "Cartridges".id
    ORDER BY "Cartridges".active DESC, "Cartridges".code
  `;

  const cartridges = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  res.json(cartridges);
});

// -- CREATE ------------------------------------------------------

routes.post('', async (req, res, next) => {
  // const { quantityResource, active } = req.body;
  // const quantityCartridge = req.body.quantityCartridge || 1;

  // const cartridges = [];
  // for (let i = 1; i <= quantityCartridge; ++i) {
  //   // eslint-disable-next-line no-await-in-loop
  //   const cartridge = await models.Cartridge.create(
  //     { quantityResource, active }
  //   );

  //   cartridges.push(cartridge.code);
  // }

  // res.json(cartridges);
});

// -- DELETE ------------------------------------------------------

routes.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  // await models.Cartridge.destroy({ where: { id } });
  return res.json({ id });
});

// -- UPDATE ------------------------------------------------------

routes.patch('/:id', async (req, res, next) => {
  // const { id } = req.params;
  // const { quantity, active } = req.body;

  // let result = null;

  // if (quantity || active) {
  //   const cartridge = await models.Cartridge.update(
  //     { quantity, active }, { returning: true, where: { id } }
  //   );
  //   result = cartridge && cartridge[1] && cartridge[1][0];
  // } else {
  //   result = await models.Cartridge.findOne({
  //     where: { id },
  //     attributes: ['id', 'code', 'quantity', 'printed', 'active', 'lastActive', 'lastDeviceId']
  //   });
  // }

  // if (!result) return next(new Error('WRONG_PARAMS'));

  // return res.json({
  //   id: result.id,
  //   code: result.code,
  //   quantity: result.quantity,
  //   printed: result.printed,
  //   active: result.active,
  //   lastActive: result.lastActive,
  //   lastDevice: result.lastDeviceId
  // });
});

module.exports = routes;
