'use strict';

const tableName = 'Cartridges';
const funcBalanceName = `${tableName}_balance()`;

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
      defaultValue: ''
    },
    quantity: {
      allowNull: false,
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    balance: {
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
    lastDevice: {
      allowNull: true,
      type: Sequelize.STRING(40)
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
    CREATE OR REPLACE FUNCTION ${funcBalanceName} RETURNS trigger AS $$
      BEGIN
        NEW.balance := NEW.quantity;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

     CREATE TRIGGER ${tableName}_balance
        BEFORE INSERT ON "${tableName}"
          FOR EACH ROW
            WHEN ( NEW.quantity IS NOT NULL AND NEW.balance = 0 )
          EXECUTE PROCEDURE ${funcBalanceName};
  `)),
  down: queryInterface => queryInterface.dropTable(tableName)
    .then(() => queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS ${funcBalanceName} CASCADE
    `))
};
