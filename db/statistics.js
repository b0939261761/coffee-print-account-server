import { connection, sql } from './database.js';

// ------------------------------

export const setStatistic = statistic => connection.maybeOne(sql`
  WITH
  "tmpDevice" ("deviceId") AS (
    UPDATE "Devices" SET "appVersionCode" = ${statistic.appVersionCode}
      WHERE id = ${statistic.deviceId} RETURNING id AS "deviceId"
  ),
  "tmpCartridge" ("cartridgeId") AS (
    SELECT id AS cartridgeId FROM "Cartridges" WHERE id = ${statistic.cartridgeId}
  ),
  "tmpStatistic" (id, "cartridgeId", "quantityPrinted") AS (
    INSERT INTO "Statistics" ("deviceId", "cartridgeId", "datePrinted", "quantityPrinted")
      SELECT
          "deviceId",
          "cartridgeId",
          CURRENT_DATE,
          ${statistic.quantityPrinted}
        FROM "tmpCartridge"
        CROSS JOIN "tmpDevice"
      ON CONFLICT ("deviceId", "cartridgeId", "datePrinted")
        DO UPDATE SET "quantityPrinted" = EXCLUDED."quantityPrinted"
      RETURNING id, "cartridgeId", "quantityPrinted"
  )
  SELECT
      "Cartridges".active,
      "Cartridges"."quantityResource",
      SUM(bb."quantityPrinted") OVER() AS "quantityPrinted",
      (SELECT "deviceId" FROM "tmpDevice") AS "deviceId"
    FROM "Cartridges"
    CROSS JOIN (
      SELECT id, "cartridgeId", "quantityPrinted" FROM "Statistics"
        WHERE "Statistics"."cartridgeId" = (SELECT "cartridgeId" FROM "tmpStatistic")
          AND "Statistics".id != (SELECT id FROM "tmpStatistic")
      UNION ALL
      SELECT id, "cartridgeId", "quantityPrinted" FROM "tmpStatistic"
    ) bb
    WHERE "Cartridges".id = (SELECT "cartridgeId" FROM "tmpStatistic")
    LIMIT 1
`);


// ------------------------------

export const getStatistic = statistic => connection.maybeOne(sql`
  WITH
  "tmpDevice" ("deviceId") AS (
    UPDATE "Devices" SET "appVersionCode" = ${statistic.appVersionCode}
      WHERE id = ${statistic.deviceId} RETURNING id AS "deviceId"
  ),
  "tmpCartridge" AS (
    SELECT
        "Cartridges".id,
        "Cartridges".active,
        "Cartridges"."quantityResource",
        SUM("Statistics"."quantityPrinted") OVER() AS "quantityPrinted"
      FROM "Cartridges"
      LEFT JOIN "Statistics" ON "Cartridges".id = "Statistics"."cartridgeId"
      WHERE "Cartridges".code = ${statistic.code}
      LIMIT 1
  ),
  statistic AS (
    INSERT INTO "Statistics" ("deviceId", "cartridgeId", "datePrinted")
    SELECT "deviceId", id, CURRENT_DATE FROM "tmpCartridge" CROSS JOIN "tmpDevice"
      ON CONFLICT ("deviceId", "cartridgeId", "datePrinted") DO NOTHING
  )
  SELECT *, (SELECT "deviceId" FROM "tmpDevice") AS "deviceId" FROM "tmpCartridge"
`);


// ------------------------------

export default {
  setStatistic,
  getStatistic
};
