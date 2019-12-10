import { connection, sql, fragmentTmpUsers } from './database.js';

//-----------------------------

export const getDevices = async user => (await connection.query(sql`
  WITH
  ${fragmentTmpUsers(user)},
  "tmpDevicesStatistics" AS (
    SELECT
      "Devices".id,
      "Devices".code,
      "Devices".city,
      "Devices".description,
      "Devices"."appVersionCode",
      "Users".email AS "userEmail",
      "Cartridges".id AS "cartridgeId",
      "Cartridges".code AS "cartridgeCode",
      "Cartridges"."quantityResource",
      SUM("Statistics"."quantityPrinted") as "quantityPrinted",
      MAX("Statistics"."lastActive") as "lastActive"
    FROM "Devices"
    LEFT JOIN "Statistics" ON "Devices".id = "Statistics"."deviceId"
    LEFT JOIN "Cartridges" ON "Statistics"."cartridgeId" = "Cartridges"."id"
    LEFT JOIN "tmpUsers" ON "tmpUsers".id = "Devices"."userId"
    LEFT JOIN "Users" ON "Users".id = "tmpUsers"."id"
    WHERE "tmpUsers".id IS NOT NULL
      OR "tmpUsers".id IS NOT DISTINCT FROM ${user.parentId}
    GROUP BY
      "Devices".id,
      "Cartridges".id,
      "Users".email
    ORDER BY "Devices".code
  )
  SELECT
    id,
    code,
    city,
    description,
    "appVersionCode",
    "userEmail",
    COALESCE(SUM("quantityPrinted"), 0) AS "quantityPrinted",
    COALESCE(JSONB_AGG(
      JSON_BUILD_OBJECT(
        'id', "cartridgeId",
        'code', "cartridgeCode",
        'quantityResource', "quantityResource",
        'quantityPrinted', "quantityPrinted",
        'lastActive', "lastActive"
      ) ORDER BY "lastActive" DESC
    ) FILTER (WHERE "cartridgeId" IS NOT NULL), '[]') AS cartridges
  FROM "tmpDevicesStatistics"
  GROUP BY
    id,
    code,
    city,
    description,
    "appVersionCode",
    "userEmail"
  ORDER BY code
`)).rows;

// ------------------------------

export const getDevice = ({ user, deviceId }) => connection.maybeOne(sql`
  WITH
  ${fragmentTmpUsers(user)}
  SELECT
      "Devices".id,
      code,
      city,
      description,
      "userId"
    FROM "Devices"
    LEFT JOIN "tmpUsers" ON "tmpUsers".id = "Devices"."userId"
    WHERE "Devices".id = ${deviceId}
      AND (
        "tmpUsers".id IS NOT NULL
        OR "tmpUsers".id IS NOT DISTINCT FROM ${user.parentId}
      )
`);

// ------------------------------

export const setDevice = ({ user, device }) => connection.maybeOne(sql`
  WITH
  ${fragmentTmpUsers(user)},
  "tmpDevice" AS (
    UPDATE "Devices" SET
      city = ${device.city},
      description = ${device.description},
      "userId" = ${device.userId}
    FROM "tmpUsers"
    WHERE "Devices".id = ${device.deviceId}
      AND (
        "Devices"."userId" = "tmpUsers".id
        OR "Devices"."userId" IS NOT DISTINCT FROM ${user.parentId}
      )
    RETURNING
      "Devices".id,
      "Devices"."userId",
      "Devices".code,
      "Devices".city,
      "Devices".description,
      "Devices"."appVersionCode"
  ),
  "tmpStatistics" AS (
    SELECT
      "Cartridges".id AS "cartridgeId",
      "Cartridges".code AS "cartridgeCode",
      "Cartridges"."quantityResource",
      SUM("Statistics"."quantityPrinted") as "quantityPrinted",
      MAX("Statistics"."lastActive") as "lastActive"
    FROM "Statistics"
    LEFT JOIN "Cartridges" ON "Statistics"."cartridgeId" = "Cartridges"."id"
    WHERE "Statistics"."deviceId" = (SELECT id FROM "tmpDevice")
    GROUP BY "Cartridges".id
  )
  SELECT
    "tmpDevice".id,
    code,
    city,
    description,
    "appVersionCode",
    "Users".email AS "userEmail",
    COALESCE(SUM("quantityPrinted"), 0) AS "quantityPrinted",
    COALESCE(JSONB_AGG(
      JSON_BUILD_OBJECT(
        'id', "cartridgeId",
        'code', "cartridgeCode",
        'quantityResource', "quantityResource",
        'quantityPrinted', "quantityPrinted",
        'lastActive', "lastActive"
      ) ORDER BY "lastActive" DESC
    ) FILTER (WHERE "cartridgeId" IS NOT NULL), '[]') AS cartridges
  FROM "tmpDevice"
  LEFT JOIN "tmpStatistics" ON TRUE
  LEFT JOIN "Users" ON "Users".id = "tmpDevice"."userId"
  GROUP BY
    "tmpDevice".id,
    code,
    city,
    description,
    "appVersionCode",
    "userEmail"
`);

// ------------------------------

export default {
  getDevices,
  getDevice,
  setDevice
};
