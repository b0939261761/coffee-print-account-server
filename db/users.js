import { connection, sql, fragmentTmpUsers } from './database.js';

// ------------------------------

export const getUserById = id => connection.maybeOne(sql`
  SELECT id AS "userId", salt, hash, "roleId" FROM "Users" WHERE id = ${id}
`);

// ------------------------------

export const getUserByEmail = email => connection.maybeOne(sql`
  SELECT id AS "userId", salt, hash, token, "roleId" FROM "Users" WHERE email = ${email}
`);

// ------------------------------

export const getUser = async ({ user, userId }) => connection.maybeOne(sql`
  WITH ${fragmentTmpUsers(user)}
  SELECT "Users".id, email, "Users"."parentId", "roleId" FROM "Users"
    INNER JOIN "tmpUsers" USING(id)
    WHERE "Users".id = ${userId}
`);

// ------------------------------

export const setUserToken = ({ userId, token }) => connection.maybeOne(sql`
  UPDATE "Users" SET token = ${token} WHERE id = ${userId} RETURNING id
`);

// ------------------------------

export const addUser = ({ user, userOptions }) => connection.maybeOne(sql`
  WITH
  ${fragmentTmpUsers(user)},
  "tmpUser" AS (
    INSERT INTO "Users"
      (email, "parentId", "roleId", salt, hash)
      SELECT
        ${userOptions.email},
        ${userOptions.parentId},
        ${userOptions.roleId},
        ${userOptions.salt},
        ${userOptions.hash}
      FROM "tmpUsers"
      WHERE "tmpUsers".id = ${userOptions.parentId}
        OR ${user.parentId}::integer IS NULL
      LIMIT 1
    RETURNING *
  )
  SELECT
    "tmpUser".id,
    "tmpUser".email,
    "Users".email AS "parentEmail",
    "Roles".name AS "roleName"
  FROM "tmpUser"
  LEFT JOIN "Users" ON "Users".id = "tmpUser"."parentId"
  LEFT JOIN "Roles" ON "Roles".id = "tmpUser"."roleId"
`);

// ------------------------------

export const setUser = ({ user, userOptions }) => connection.maybeOne(sql`
   WITH
   ${fragmentTmpUsers(user)},
   "tmpUser" AS (
      UPDATE "Users" SET
        email = ${userOptions.email},
        salt = ${userOptions.salt},
        hash = ${userOptions.hash}
      FROM "tmpUsers"
      WHERE "Users".id = ${userOptions.userId}
        AND (
          "tmpUsers".id = "Users".id
          OR "tmpUsers".id IS NOT DISTINCT FROM ${user.parentId}
        )
      RETURNING "Users".*
    )
    SELECT
      "tmpUser".id,
      "tmpUser".email,
      "Users".email AS "parentEmail",
      "Roles".name AS "roleName"
    FROM "tmpUser"
    LEFT JOIN "Users" ON "Users".id = "tmpUser"."parentId"
    LEFT JOIN "Roles" ON "Roles".id = "tmpUser"."roleId"
`);

// ------------------------------

export const getUserChildren = async ({ userId, parentId }) => (await connection.query(sql`
  WITH
  RECURSIVE "tmpUsers" (id, email) AS (
    SELECT id, email FROM "Users"
      WHERE id = ${userId} OR "parentId" IS NOT DISTINCT FROM ${parentId}
    UNION ALL
    SELECT "Users".id, "Users".email FROM "Users"
      INNER JOIN "tmpUsers" ON "Users"."parentId" = "tmpUsers".id
  )
  SELECT id, email FROM "tmpUsers" ORDER BY email
`)).rows;

// ------------------------------

export const getUserList = async ({ user, minRoleId }) => (await connection.query(sql`
  WITH
  RECURSIVE "tmpUsers" AS (
    SELECT id, email FROM "Users"
      WHERE "Users"."roleId" <= ${minRoleId}
        AND (
          id = ${user.userId}
          OR "parentId" IS NOT DISTINCT FROM ${user.parentId}
        )

    UNION ALL

    SELECT "Users".id, "Users".email FROM "Users"
      INNER JOIN "tmpUsers" ON "Users"."parentId" = "tmpUsers".id
      WHERE "Users"."roleId" BETWEEN ${user.roleId} AND ${minRoleId}
  )
  SELECT id, email FROM "tmpUsers" ORDER BY email
`)).rows;

// ------------------------------

export const getUsers = async ({ userId, parentId }) => (await connection.query(sql`
  WITH
  RECURSIVE "tmpUsers" AS (
    SELECT
        "Users".id,
        "Users".email,
        bb.email AS "parentEmail",
        "Users"."roleId",
        "Users".email::TEXT AS sort
      FROM "Users"
      LEFT JOIN "Users" bb ON bb."id" = "Users"."parentId"
      WHERE "Users".id = ${userId}
        OR "Users"."parentId" IS NOT DISTINCT FROM ${parentId}

    UNION ALL

    SELECT
        "Users".id,
        "Users".email,
        "tmpUsers".email AS "parentEmail",
        "Users"."roleId",
        "tmpUsers".email || '|' ||"Users".email AS sort
      FROM "Users"
      INNER JOIN "tmpUsers" ON "tmpUsers".id = "Users"."parentId"
  )
  SELECT
      "tmpUsers".id,
      "tmpUsers".email,
      "tmpUsers"."parentEmail",
      "Roles".name AS "roleName"
    FROM "tmpUsers"
    LEFT JOIN "Roles" ON  "Roles".id = "tmpUsers"."roleId"
    ORDER BY "tmpUsers".sort
`)).rows;

// ------------------------------

export default {
  getUserById,
  getUserByEmail,
  getUser,
  addUser,
  setUserToken,
  setUser,
  getUserChildren,
  getUserList,
  getUsers
};
