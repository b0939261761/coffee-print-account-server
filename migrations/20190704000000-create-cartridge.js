const tableName = 'Cartridges';
const funcInsertName = `${tableName}_insert`;

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
        type: Sequelize.STRING(9),
        defaultValue: '',
        unique: true
      },
      quantityResource: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

    return queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION "${funcInsertName}"() RETURNS trigger AS $$
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

      CREATE TRIGGER "${tableName}_insert"
          BEFORE INSERT ON "${tableName}"
            FOR EACH ROW
            EXECUTE PROCEDURE "${funcInsertName}"();
    `);
  },
  down: async queryInterface => {
    await queryInterface.dropTable(tableName);
    return queryInterface.sequelize.query(`
      DROP FUNCTION IF EXISTS "${funcInsertName}"();
    `);
  }
};
