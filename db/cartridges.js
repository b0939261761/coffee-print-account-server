import { connection, sql, fragmentTmpUsers } from './database.js';

//-----------------------------

export const getCartridges = async user => (await connection.query(sql`
  WITH
  ${fragmentTmpUsers(user)},
  "tmpCartridgesStatistics" AS (
    SELECT
      "Cartridges".id,
      "Cartridges".code,
      "Cartridges".active,
      "Cartridges"."quantityResource",
      "Users".email AS "userEmail",
      "Devices".id AS "deviceId",
      "Devices".code AS "deviceCode",
      "Devices".city AS "deviceCity",
      "Devices".description AS "deviceDescription",
      SUM("Statistics"."quantityPrinted") as "quantityPrinted",
      MAX("Statistics"."lastActive") as "lastActive"
    FROM "Cartridges"
    LEFT JOIN "Statistics" ON "Cartridges".id = "Statistics"."cartridgeId"
    LEFT JOIN "Devices" ON "Devices"."id" = "Statistics"."deviceId"
    LEFT JOIN "tmpUsers" ON "tmpUsers".id = "Cartridges"."userId"
    LEFT JOIN "Users" ON "Users".id = "tmpUsers"."id"
    WHERE "tmpUsers".id IS NOT NULL
      OR "tmpUsers".id IS NOT DISTINCT FROM ${user.parentId}
    GROUP BY
      "Cartridges".id,
      "Devices".id,
      "Users".email
    ORDER BY "Cartridges".code
  )
  SELECT
    id,
    code,
    active,
    "quantityResource",
    "userEmail",
    COALESCE(SUM("quantityPrinted"), 0) AS "quantityPrinted",
    COALESCE(JSONB_AGG(
      JSON_BUILD_OBJECT(
        'id', "deviceId",
        'code', "deviceCode",
        'city', "deviceCity",
        'description', "deviceDescription",
        'quantityPrinted', "quantityPrinted",
        'lastActive', "lastActive"
      ) ORDER BY "lastActive" DESC
    ) FILTER (WHERE "deviceId" IS NOT NULL), '[]') AS devices
  FROM "tmpCartridgesStatistics"
  GROUP BY
    id,
    code,
    active,
    "quantityResource",
    "userEmail"
`)).rows;

// ------------------------------

export const getCartridge = ({ user, cartridgeId }) => connection.maybeOne(sql`
  WITH
  ${fragmentTmpUsers(user)}
  SELECT
      "Cartridges".id,
      code,
      "quantityResource",
      active,
      "userId"
    FROM "Cartridges"
    LEFT JOIN "tmpUsers" ON "tmpUsers".id = "Cartridges"."userId"
    WHERE "Cartridges".id = ${cartridgeId}
      AND (
        "tmpUsers".id IS NOT NULL
        OR "tmpUsers".id IS NOT DISTINCT FROM ${user.parentId}
      )
`);

// ------------------------------

export const setCartridge = ({ user, cartridge }) => connection.maybeOne(sql`
  WITH
  ${fragmentTmpUsers(user)},
  "tmpCartridge" AS (
    UPDATE "Cartridges" SET
      "quantityResource" = ${cartridge.quantityResource},
      active = ${cartridge.active},
      "userId" = ${cartridge.userId}
    FROM "tmpUsers"
    WHERE "Cartridges".id = ${cartridge.cartridgeId}
      AND (
        "Cartridges"."userId" = "tmpUsers".id
        OR "Cartridges"."userId" IS NOT DISTINCT FROM ${user.parentId}
      )
    RETURNING
      "Cartridges".id,
      "Cartridges"."userId",
      "Cartridges".code,
      "Cartridges".active,
      "Cartridges"."quantityResource"
  ),
  "tmpStatistics" AS (
    SELECT
      "Statistics"."cartridgeId",
      "Devices".id AS "deviceId",
      "Devices".code AS "deviceCode",
      "Devices".city AS "deviceCity",
      "Devices".description AS "deviceDescription",
      SUM("Statistics"."quantityPrinted") as "quantityPrinted",
      MAX("Statistics"."lastActive") as "lastActive"
    FROM "Statistics"
    LEFT JOIN "Devices" ON "Devices".id = "Statistics"."deviceId"
    WHERE "Statistics"."cartridgeId" = (SELECT id FROM "tmpCartridge")
    GROUP BY
      "Statistics"."cartridgeId",
      "Devices".id
  )
  SELECT
    "tmpCartridge".id,
    code,
    active,
    "quantityResource",
    "Users".email AS "userEmail",
    COALESCE(SUM("quantityPrinted"), 0) AS "quantityPrinted",
    COALESCE(JSONB_AGG(
      JSON_BUILD_OBJECT(
        'id', "deviceId",
        'code', "deviceCode",
        'city', "deviceCity",
        'description', "deviceDescription",
        'quantityPrinted', "quantityPrinted",
        'lastActive', "lastActive"
      ) ORDER BY "lastActive" DESC
    ) FILTER (WHERE "deviceId" IS NOT NULL), '[]') AS devices
  FROM "tmpCartridge"
  LEFT JOIN "tmpStatistics" ON "tmpStatistics"."cartridgeId" = "tmpCartridge".id
  LEFT JOIN "Users" ON "Users".id = "tmpCartridge"."userId"
  GROUP BY
    "tmpCartridge".id,
    code,
    active,
    "quantityResource",
    "userEmail"
`);

// ------------------------------

export default {
  getCartridges,
  getCartridge,
  setCartridge
};
