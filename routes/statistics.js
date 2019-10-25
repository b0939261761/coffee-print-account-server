const routes = require('express').Router();
const { sequelize } = require('../models');

// ---------------------------------------------------------------------------
// -- UPDATE STATISTICS ------------------------------------------------------
// ---------------------------------------------------------------------------

routes.patch('/statistics', async (req, res, next) => {
  const {
    deviceId, cartridgeId, quantityPrinted = 0, appVersionCode = 0
  } = req.body;

  if (!cartridgeId) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));
  if (!deviceId) return next(new Error('DEVICE_DOES_NOT_EXIST'));

  const datePrinted = new Date().toISOString().slice(0, 10); // yyyy-MM-dd

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
        INSERT INTO "Statistics" ("deviceId", "cartridgeId", "datePrinted", "quantityPrinted")
          SELECT "deviceId", "cartridgeId", '${datePrinted}', ${quantityPrinted} FROM cartridge
            CROSS JOIN device
          ON CONFLICT ("deviceId", "cartridgeId", "datePrinted")
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
    quantityPrinted: cartridge.quantityPrinted,
    active: cartridge.active
  });
});

// -- GET ACTIVATION ------------------------------------------------------

routes.get('', async (req, res, next) => {
  const { code } = req.params;
  const deviceId = +req.params.deviceId;
  const appVersionCode = +req.params.appVersionCode;

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

module.exports = routes;
