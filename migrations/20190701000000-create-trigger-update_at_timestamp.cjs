const functionName = 'updateAtTimestamp';

module.exports = {
  up: knex => knex.raw(`
    CREATE OR REPLACE FUNCTION "${functionName}"() RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" := CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE PLPGSQL;
  `),
  down: knex => knex.raw(`
    DROP FUNCTION IF EXISTS "${functionName}"() CASCADE;
  `)
};
