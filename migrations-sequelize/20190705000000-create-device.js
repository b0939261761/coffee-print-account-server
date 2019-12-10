const tableName = 'Devices';

module.exports = {
  up: ({ sequelize }) => {
    const devices = Array.from(
      { length: 1000 }, (_, i) => `('1${(i + 1).toString().padStart(4, '0')}')`
    );
    return sequelize.query(`
      CREATE TABLE "${tableName}" (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "Users" (id) ON DELETE CASCADE,
        "code" VARCHAR(5) NOT NULL DEFAULT '' UNIQUE,
        "city" VARCHAR(50) NOT NULL DEFAULT '',
        "description" VARCHAR(255) NOT NULL DEFAULT '',
        "appVersionCode" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TRIGGER "${tableName}UpdateAt"
        BEFORE UPDATE ON "${tableName}"
          FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

      INSERT INTO "${tableName}" (code) VALUES ${devices.join(',')}
    `);
  },
  down: ({ sequelize }) => sequelize.query(`DROP TABLE IF EXISTS "${tableName}";`)
};
