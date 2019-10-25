const routes = require('express').Router();
const { cryptoPassword } = require('../utils/password');
const { sequelize } = require('../models');

// -- GET ALL ----------------------------------------------------------------

routes.get('', async (req, res) => {
  const { userId, parentId } = req;

  const sql = `
    WITH RECURSIVE tree AS (
      SELECT
          0 as level,
          id,
          email,
          email::TEXT AS sort,
          "parentId",
          "roleId"
        FROM "Users"
        WHERE id = ${userId}
          OR "parentId" IS NOT DISTINCT FROM ${parentId}

      UNION ALL

      SELECT
          tree.level + 1,
          "Users".id,
          "Users".email,
          tree.email || '|' ||"Users".email AS sort,
          "Users"."parentId",
          "Users"."roleId"
        FROM "Users"
        INNER JOIN tree ON "Users"."parentId" = tree.id
    )
    SELECT
        tree.id,
        tree.email,
        "Users".email AS "parentEmail",
        "Roles".name AS "roleName"
      FROM tree
      LEFT JOIN "Users" ON tree."parentId" = "Users".id
      LEFT JOIN "Roles" ON tree."roleId" = "Roles".id
      ORDER BY tree.sort
  `;

  const response = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  return res.json(response);
});

// -- CREATE ------------------------------------------------------

routes.post('', async (req, res, next) => {
  const { email, roleId, password } = req.body;

  const { salt, hash } = cryptoPassword(password);

  const parentId = roleId === 1 ? 'NULL' : req.body.parentId;

  const sql = `
    WITH "user" AS (
      INSERT INTO "Users"
        (email, "parentId", "roleId", salt, hash)
        VALUES
        ('${email}', ${parentId}, ${roleId}, '${salt}', '${hash}')
        RETURNING *
    )
    SELECT
      "user".id,
      "user".email,
      "Users".email AS "parentEmail",
      "Roles".name AS "roleName"
    FROM "user"
    LEFT JOIN "Users" ON "user"."parentId" = "Users".id
    LEFT JOIN "Roles" ON "user"."roleId" = "Roles".id
  `;

  const { 0: response } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!response) return next(new Error('WRONG_PARAMS'));

  return res.json(response);
});

// -- UPDATE ------------------------------------------------------

routes.patch('/:userId', async (req, res, next) => {
  const { userId } = req.params;
  const { email, password } = req.body;

  const { salt, hash } = cryptoPassword(password);

  const sql = `
      WITH "user" AS (
        UPDATE "Users" SET
          email = '${email}',
          salt = '${salt}',
          hash = '${hash}'
        WHERE id = ${userId}
        RETURNING *
      )
      SELECT
        "user".id,
        "user".email,
        "Users".email AS "parentEmail",
        "Roles".name AS "roleName"
      FROM "user"
      LEFT JOIN "Users" ON "user"."parentId" = "Users".id
      LEFT JOIN "Roles" ON "user"."roleId" = "Roles".id
  `;
  const { 0: cartridge } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!cartridge) return next(new Error('WRONG_PARAMS'));

  return res.json(cartridge);
});


// -- LIST ------------------------------------------------------

routes.get('/list', async (req, res) => {
  const { roleId, userId, parentId } = req;
  const minRoleId = +req.query.roleId - 1;

  const sql = `
    WITH RECURSIVE tree AS (
      SELECT
          0 as level,
          id,
          email,
          email::TEXT AS sort,
          "parentId",
          "roleId"
        FROM "Users"
        WHERE "Users"."roleId" <= ${minRoleId}
          AND (id = ${userId}
            OR "parentId" IS NOT DISTINCT FROM ${parentId})

      UNION ALL

      SELECT
          tree.level + 1,
          "Users".id,
          "Users".email,
          tree.email || '|' ||"Users".email AS sort,
          "Users"."parentId",
          "Users"."roleId"
        FROM "Users"
        INNER JOIN tree ON "Users"."parentId" = tree.id
        WHERE "Users"."roleId" BETWEEN ${roleId} AND ${minRoleId}
    )
    SELECT
        tree.level,
        tree.id,
        tree.email,
        tree."roleId",
        "Roles".name
      FROM tree
      LEFT JOIN "Roles" ON tree."roleId" = "Roles".id
      ORDER BY tree.email
  `;

  const response = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  res.json(response);
});

// -- LIST ------------------------------------------------------

routes.get('/children', async (req, res) => {
  const { userId, parentId } = req;

  const sql = `
    WITH RECURSIVE "UsersTree" AS (
      SELECT
          id,
          email,
          email::TEXT AS sort,
          "parentId"
        FROM "Users"
        WHERE id = ${userId}
            OR "parentId" IS NOT DISTINCT FROM ${parentId}

      UNION ALL

      SELECT
          "Users".id,
          "Users".email,
          "UsersTree".email || '|' || "Users".email AS sort,
          "Users"."parentId"
        FROM "Users"
        INNER JOIN "UsersTree" ON "Users"."parentId" = "UsersTree".id
    )
    SELECT id, email FROM "UsersTree" ORDER BY email
  `;

  const response = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });
  res.json(response);
});

// -- USER ------------------------------------------------------

routes.get('/:userId', async (req, res, next) => {
  const { userId } = req.params;

  const sql = `
    SELECT id, email, "parentId", "roleId"
      FROM "Users"
      WHERE id = ${userId}
  `;

  const { 0: response } = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  if (!response) return next(new Error('WRONG_PARAMS'));

  return res.json(response);
});


module.exports = routes;

// const dd = `
// SELECT aa.id, aa.email, JSONB_AGG(bb.*) AS child
//   FROM "Users" aa
//   LEFT JOIN LATERAL (
//     SELECT b1.id, b1.email, JSONB_AGG(cc.*) AS child FROM "Users" b1
//     LEFT JOIN LATERAL (
//       SELECT c1.id, c1.email, JSONB_AGG(dd.*) AS child FROM "Users" c1
//       LEFT JOIN LATERAL (
//         SELECT d1.id, d1.email FROM "Users" d1 WHERE d1."parentId" = c1.id
//       ) dd ON true
//       WHERE c1."parentId" = b1.id
//       GROUP BY c1.id
//     ) cc ON true
//     WHERE b1."parentId" = aa.id
//     GROUP BY b1.id
//   ) bb ON true
//   WHERE aa."parentId" IS NULL
//   GROUP by aa.id
// `;
