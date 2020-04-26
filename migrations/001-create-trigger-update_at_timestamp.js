const functionName = 'updateAtTimestamp';

const up = `
  CREATE OR REPLACE FUNCTION "${functionName}"() RETURNS TRIGGER AS $$
    BEGIN
      NEW."updatedAt" := CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
  $$ LANGUAGE PLPGSQL;
`;

const down = `DROP FUNCTION IF EXISTS "${functionName}"() CASCADE;`

export default { up, down };
