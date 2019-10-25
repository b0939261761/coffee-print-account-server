const routes = require('express').Router();
const { sequelize } = require('../models');

// -- GET ALL ----------------------------------------------------------------

routes.get('', async (req, res) => {
  const roleId = req.isAdmin ? 0 : req.roleId;

  const sql = `
    SELECT id, name
      FROM "Roles"
      WHERE id > ${roleId}
      ORDER BY id
  `;

  const response = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT });

  res.json(response);
});

module.exports = routes;
