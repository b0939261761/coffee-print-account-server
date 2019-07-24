'use strict';

const tableName = 'Cartridges';
const funcInsertName = `${tableName}_insert()`;
const funcUpdateName = `${tableName}_update()`;

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(tableName, {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    },
    code: {
      allowNull: false,
      type: Sequelize.STRING(9),
      defaultValue: '',
      unique: true
    },
    quantity: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    printed: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    active: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    lastActive: {
      allowNull: true,
      type: Sequelize.DATE
    },
    lastDeviceId: {
      allowNull: true,
      type: Sequelize.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }).then(() => queryInterface.sequelize.query(`
    CREATE TRIGGER ${tableName}_update_at
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp()
  `)).then(() => queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION ${funcInsertName} RETURNS trigger AS $$
      BEGIN
        IF NEW.code = '' OR NEW.code IS NULL THEN
          NEW.code := (WITH RECURSIVE serialNumber AS (
              SELECT
                LPAD((RANDOM() * 1e9)::bigint::character(9), 9, '0') AS code,
                0 AS nested
              UNION ALL
              SELECT
                LPAD((RANDOM() * 1e9)::bigint::character(9), 9, '0') AS code,
                nested + 1 AS nested
              FROM serialNumber WHERE nested < 1e6
            )
            SELECT code FROM serialNumber
              WHERE NOT EXISTS (
                SELECT FROM "Cartridges" WHERE code = serialNumber.code
              )
              LIMIT 1
          );
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

     CREATE TRIGGER ${tableName}_insert
        BEFORE INSERT ON "${tableName}"
          FOR EACH ROW
          EXECUTE PROCEDURE ${funcInsertName};


    CREATE OR REPLACE FUNCTION ${funcUpdateName} RETURNS trigger AS $$
      BEGIN
        IF NEW.printed > OLD.printed THEN
          NEW."lastActive" := CURRENT_TIMESTAMP;
        ELSE
          NEW.printed := OLD.printed;
          NEW."lastDeviceId" := OLD."lastDeviceId";
          NEW."lastActive" := OLD."lastActive";
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

     CREATE TRIGGER ${tableName}_update
        BEFORE UPDATE ON "${tableName}"
          FOR EACH ROW
            WHEN (NEW.printed IS NOT NULL OR NEW."lastDeviceId" IS NOT NULL OR NEW."lastActive" IS NOT NULL)
          EXECUTE PROCEDURE ${funcUpdateName};
  `)),
  down: queryInterface => queryInterface.dropTable(tableName)
    .then(() => queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS ${funcInsertName};
      DROP FUNCTION IF EXISTS ${funcUpdateName};
    `))
};
