const tableName = 'Roles';

module.exports = {
  up: ({ sequelize }) => sequelize.query(`
    CREATE TABLE "${tableName}" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(40) NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TRIGGER "${tableName}UpdateAt"
      BEFORE UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

    INSERT INTO "${tableName}" (name)
      VALUES ('admin'), ('trader'), ('dealer'), ('customer');
  `),
  down: ({ sequelize }) => sequelize.query(`DROP TABLE IF EXISTS "${tableName}";`)
};
