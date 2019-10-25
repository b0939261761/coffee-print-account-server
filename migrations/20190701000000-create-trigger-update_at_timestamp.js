const functionName = 'updateAtTimestamp';

module.exports = {
  up: queryInterface => queryInterface.sequelize.query(`
    CREATE OR REPLACE FUNCTION "${functionName}"() RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" := CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE PLPGSQL;
  `),
  down: ({ sequelize }) => sequelize.query(`
    DROP FUNCTION IF EXISTS "${functionName}"() CASCADE;
  `)
};
