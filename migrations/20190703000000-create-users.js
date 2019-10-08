const { cryptoPassword } = require('../utils/password');

const tableName = 'Users';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(100),
        defaultValue: '',
        unique: true
      },
      salt: {
        allowNull: false,
        type: Sequelize.STRING(32),
        defaultValue: ''
      },
      hash: {
        allowNull: false,
        type: Sequelize.STRING(128),
        defaultValue: ''
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING(254),
        defaultValue: ''
      },
      parentId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: tableName,
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      roleId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Roles',
          key: 'id'
        },
        onDelete: 'CASCADE'
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

    const { salt, hash } = cryptoPassword('6k3vddrb2v');

    return queryInterface.sequelize.query(`
      INSERT INTO "${tableName}" (email, "roleId", salt, hash)
        VALUES ('admin', 1, '${salt}', '${hash}')
    `);
  },
  down: queryInterface => queryInterface.dropTable(tableName)
};
