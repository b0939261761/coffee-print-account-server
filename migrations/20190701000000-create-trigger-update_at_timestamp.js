'use strict';

module.exports = {
  up: queryInterface => queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION update_at_timestamp() RETURNS trigger AS $$
      BEGIN
        NEW."updatedAt" := current_timestamp;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
  `),
  down: queryInterface => queryInterface.sequelize.query(`
    DROP FUNCTION IF EXISTS update_at_timestamp() CASCADE
  `)
};
