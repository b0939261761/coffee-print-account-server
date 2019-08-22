const tableName = 'Statistics';
const funcUpdateName = `${tableName}_update`;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      deviceId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Devices',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      cartridgeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Cartridges',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      quantityPrinted: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastActive: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    await queryInterface.addIndex(tableName, ['deviceId', 'cartridgeId'], { unique: true });

    await queryInterface.sequelize.query(`
      CREATE TRIGGER "${tableName}_update_at"
        BEFORE UPDATE ON "${tableName}"
          FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp()
    `);
    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION "${funcUpdateName}"() RETURNS trigger AS $$
        BEGIN
          IF NEW."quantityPrinted" > 0 THEN
            NEW."quantityPrinted" := NEW."quantityPrinted" + OLD."quantityPrinted";
            NEW."lastActive" := CURRENT_TIMESTAMP;
          ELSE
            NEW."quantityPrinted" := OLD."quantityPrinted";
          END IF;

          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

      CREATE TRIGGER "${tableName}_update"
          BEFORE UPDATE ON "${tableName}"
            FOR EACH ROW
              WHEN (NEW."quantityPrinted" IS NOT NULL OR NEW."lastActive" IS NOT NULL)
            EXECUTE PROCEDURE "${funcUpdateName}"();
    `);
  },
  down: async queryInterface => {
    await queryInterface.dropTable(tableName);
    return queryInterface.sequelize.query(`DROP FUNCTION IF EXISTS "${funcUpdateName}"();`);
  }
};
