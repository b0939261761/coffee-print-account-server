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
      userId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    await queryInterface.sequelize.query(`
      CREATE TRIGGER "${tableName}_update_at"
        BEFORE UPDATE ON "${tableName}"
          FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp()
    `);

    // ---------------------------------

    const devices = [];
    for (let i = 1; i <= 1000; ++i) {
      devices.push(`('1${(i).toString().padStart(4, '0')}', 'Устройство: ${i}')`);
    }

    return queryInterface.sequelize.query(`
      INSERT INTO "${tableName}" (code, description)
        VALUES ${devices.join(',')}
    `);
  },
  down: queryInterface => queryInterface.dropTable(tableName)
};
