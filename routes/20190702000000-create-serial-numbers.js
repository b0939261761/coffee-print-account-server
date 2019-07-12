'use strict';

const tableName = 'SerialNumbers';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable(tableName, {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER
    }
  }).then(() => queryInterface.sequelize.query(`

  `)),
  down: queryInterface => queryInterface.dropTable(tableName)
};
