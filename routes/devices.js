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
      COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
      "UsersTree".email as "userEmail",
      JSONB_AGG(
        JSON_BUILD_OBJECT(
          'cartridgeId', "Cartridges".id,
          'cartridgeCode', "Cartridges".code,
          'quantityResource', "Cartridges"."quantityResource",
          'quantityPrinted', "Statistics"."quantityPrinted",
          'lastActive', "Statistics"."lastActive"
        ) ORDER BY "Statistics"."lastActive" DESC
      ) AS cartridges
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

module.exports = routes;