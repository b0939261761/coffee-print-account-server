const tableName = 'Devices';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING(5),
        defaultValue: '',
        unique: true
      },
      city: {
        allowNull: false,
        type: Sequelize.STRING(50),
        defaultValue: ''
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING(255),
        defaultValue: ''
      },
      appVersionCode: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    });

    return queryInterface.sequelize.query(`
      CREATE TRIGGER ${tableName}_update_at
        BEFORE UPDATE ON "${tableName}"
          FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp()
    `);
  },
  down: queryInterface => queryInterface.dropTable(tableName)
};
