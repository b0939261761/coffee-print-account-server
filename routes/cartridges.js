const routes = require('express').Router();
const { sequelize } = require('../models');
const verifyToken = require('./verifyToken');


// --- Костыль для перехода на версия 3.1.8
// -- UPDATE STATISTICS ------------------------------------------------------

routes.patch('/statistics/:id', async (req, res, next) => res.json({
  quantity: 0,
  printed: 0,
  active: false
}));

// -- GET ACTIVATION ------------------------------------------------------

routes.get('/activation/:code', async (req, res, next) => res.json({
  id: 0,
  quantity: 0,
  printed: 0,
  active: false
}));
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------


// ---------------------------------------------------------------------------
// -- UPDATE STATISTICS ------------------------------------------------------
// ---------------------------------------------------------------------------

// --- Костыль версий 3.1.12 - роут перехал в statistic
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
// --- Костыль версий 3.1.12 - роут перехал в statistic
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

routes.get('', verifyToken, async (req, res) => {
  const { isAdmin, userId, parentId } = req;

  const usersTreeId = isAdmin ? 'NULL' : 0;

  const sql = `
    WITH RECURSIVE "UsersTree" AS (
      SELECT
          id,
          email,
          "parentId"
        FROM "Users"
        WHERE id = ${userId}
          OR "parentId" IS NOT DISTINCT FROM ${parentId}

      UNION ALL

      SELECT
          "Users".id,
          "Users".email,
          "Users"."parentId"
        FROM "Users"
        INNER JOIN "UsersTree" ON "Users"."parentId" = "UsersTree".id
    )
    SELECT
      "Cartridges".id,
      "Cartridges".code,
      "Cartridges".active,
      "Cartridges"."quantityResource",
      "UsersTree".email as "userEmail",
      COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
      COALESCE(JSONB_AGG(
        JSON_BUILD_OBJECT(
          'quantityPrinted', "Statistics"."quantityPrinted",
          'id', "Statistics"."deviceId",
          'code', "Devices".code,
          'city', "Devices".city,
          'description', "Devices".description,
          'lastActive', "Statistics"."lastActive"
        ) ORDER BY "Statistics"."lastActive" DESC
      ) FILTER (WHERE "Devices".id IS NOT NULL), '[]') AS devices
    FROM "Cartridges"
    LEFT JOIN "Statistics" ON "Cartridges".id = "Statistics"."cartridgeId"
    LEFT JOIN "Devices" ON "Statistics"."deviceId" = "Devices".id
    LEFT JOIN "UsersTree" ON "UsersTree".id = "Cartridges"."userId"
    WHERE "UsersTree".id IS NOT NULL
      OR "UsersTree".id IS NOT DISTINCT FROM ${usersTreeId}
    GROUP BY "Cartridges".id, "UsersTree".email
    ORDER BY "Cartridges".active DESC, "Cartridges".code
  `;

  const cartridges = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  res.json(cartridges);
});

// -- UPDATE ------------------------------------------------------

routes.patch('/:id', verifyToken, async (req, res, next) => {
  const { id } = req.params;
  const { quantityResource, active, userId } = req.body;

  const sql = `
    WITH "Cartridge" AS (
      UPDATE "Cartridges" SET
          "quantityResource" = ${quantityResource},
          active = ${active},
          "userId" = ${userId}
        WHERE id = ${id}
        RETURNING *
    )
    SELECT
      "Cartridge".id,
      "Cartridge".code,
      "Cartridge".active,
      "Cartridge"."quantityResource",
      "Users".email as "userEmail",
      COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
      COALESCE(JSONB_AGG(
        JSON_BUILD_OBJECT(
          'quantityPrinted', "Statistics"."quantityPrinted",
          'id', "Statistics"."deviceId",
          'code', "Devices".code,
          'city', "Devices".city,
          'description', "Devices".description,
          'lastActive', "Statistics"."lastActive"
        ) ORDER BY "Statistics"."lastActive" DESC
      ) FILTER (WHERE "Devices".id IS NOT NULL), '[]') AS devices
    FROM "Cartridge"
    LEFT JOIN "Statistics" ON "Cartridge".id = "Statistics"."cartridgeId"
    LEFT JOIN "Devices" ON "Statistics"."deviceId" = "Devices".id
    LEFT JOIN "Users" ON "Users".id = "Cartridge"."userId"
    GROUP BY "Cartridge".id, "Cartridge".code, "Cartridge".active,
      "Cartridge"."quantityResource", "Users".email
  `;
  const { 0: cartridge } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!cartridge) return next(new Error('WRONG_PARAMS'));

  return res.json(cartridge);
});

// -- GET ID ------------------------------------------------------

routes.get('/:cartridgeId', async (req, res, next) => {
  const { cartridgeId } = req.params;

  const sql = `
    SELECT id, code, "quantityResource", active, "userId"
      FROM "Cartridges"
      WHERE id = ${cartridgeId}
  `;

  const { 0: response } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!response) return next(new Error('WRONG_PARAMS'));

  return res.json(response);
});

module.exports = routes;
