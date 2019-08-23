const routes = require('express').Router();
const { sequelize } = require('../models');

// -- GET ALL ----------------------------------------------------------------

routes.get('', async (req, res) => {
  const sql = `
    SELECT
      "Devices".id,
      "Devices".code,
      "Devices".city,
      "Devices".description,
      "Devices"."appVersionCode",
      COALESCE(SUM("Statistics"."quantityPrinted"), 0) AS "quantityPrinted",
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
    GROUP BY "Devices".id
    ORDER BY "Devices".code
  `;

  const response = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  res.json(response);
});

module.exports = routes;
