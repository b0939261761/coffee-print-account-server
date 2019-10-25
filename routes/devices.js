const routes = require('express').Router();
const { sequelize } = require('../models');

// -- GET ALL ----------------------------------------------------------------

routes.get('', async (req, res) => {
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
      "Devices".id,
      "Devices".code,
      "Devices".city,
      "Devices".description,
      "Devices"."appVersionCode",
      "UsersTree".email as "userEmail",
      COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
      COALESCE(JSONB_AGG(
        JSON_BUILD_OBJECT(
          'id', "Cartridges".id,
          'code', "Cartridges".code,
          'quantityResource', "Cartridges"."quantityResource",
          'quantityPrinted', "Statistics"."quantityPrinted",
          'lastActive', "Statistics"."lastActive"
        ) ORDER BY "Statistics"."lastActive" DESC
      ) FILTER (WHERE "Cartridges".id IS NOT NULL), '[]') AS cartridges
    FROM "Devices"
    LEFT JOIN "Statistics" ON "Devices".id = "Statistics"."deviceId"
    LEFT JOIN "Cartridges" ON "Statistics"."cartridgeId" = "Cartridges"."id"
    LEFT JOIN "UsersTree" ON "UsersTree".id = "Devices"."userId"
    WHERE "UsersTree".id IS NOT NULL
      OR "UsersTree".id IS NOT DISTINCT FROM ${usersTreeId}
    GROUP BY "Devices".id, "UsersTree".email
    ORDER BY "Devices".code
  `;

  const response = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  res.json(response);
});

// -- UPDATE ------------------------------------------------------

routes.patch('/:deviceId', async (req, res, next) => {
  const { deviceId } = req.params;
  const { city, description, userId } = req.body;

  const sql = `
      WITH "Device" AS (
        UPDATE "Devices" SET
          city = '${city}',
          description = '${description}',
          "userId" = ${userId}
        WHERE id = ${deviceId}
        RETURNING *
      )
      SELECT
        "Device".id,
        "Device".code,
        "Device".city,
        "Device".description,
        "Device"."appVersionCode",
        "Users".email as "userEmail",
        COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
        COALESCE(JSONB_AGG(
          JSON_BUILD_OBJECT(
            'id', "Cartridges".id,
            'code', "Cartridges".code,
            'quantityResource', "Cartridges"."quantityResource",
            'quantityPrinted', "Statistics"."quantityPrinted",
            'lastActive', "Statistics"."lastActive"
          ) ORDER BY "Statistics"."lastActive" DESC
        ) FILTER (WHERE "Cartridges".id IS NOT NULL), '[]') AS cartridges
      FROM "Device"
      LEFT JOIN "Statistics" ON "Device".id = "Statistics"."deviceId"
      LEFT JOIN "Cartridges" ON "Statistics"."cartridgeId" = "Cartridges"."id"
      LEFT JOIN "Users" ON "Users".id = "Device"."userId"
      GROUP BY "Device".id, "Device".code, "Device".city,
        "Device".description, "Device"."appVersionCode", "Users".email
  `;
  const { 0: cartridge } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!cartridge) return next(new Error('WRONG_PARAMS'));

  return res.json(cartridge);
});


// -- GET ID ------------------------------------------------------

routes.get('/:deviceId', async (req, res, next) => {
  const { deviceId } = req.params;

  const sql = `
    SELECT id, code, city, description, "userId"
      FROM "Devices"
      WHERE id = ${deviceId}
  `;

  const { 0: response } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!response) return next(new Error('WRONG_PARAMS'));

  return res.json(response);
});

module.exports = routes;
