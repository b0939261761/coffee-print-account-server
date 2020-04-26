const tableName = 'Cartridges';
const funcInsertName = `${tableName}Insert`;

const up = `
  CREATE TABLE "${tableName}" (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER REFERENCES "Users" (id) ON DELETE CASCADE,
    "code" VARCHAR(9) NOT NULL DEFAULT '' UNIQUE,
    "quantityResource" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TRIGGER "${tableName}UpdateAt"
    BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

  CREATE OR REPLACE FUNCTION "${funcInsertName}"() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.code = '' OR NEW.code IS NULL THEN
        NEW.code := (
          WITH RECURSIVE serialNumber AS (
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
              SELECT FROM "${tableName}" WHERE code = serialNumber.code
            )
            LIMIT 1
        );
      END IF;

      RETURN NEW;
    END;
  $$ LANGUAGE PLPGSQL;

  CREATE TRIGGER "${tableName}Insert"
    BEFORE INSERT ON "${tableName}"
      FOR EACH ROW
      EXECUTE PROCEDURE "${funcInsertName}"();
`;

const down = `
  DROP TABLE IF EXISTS "${tableName}";
  DROP FUNCTION IF EXISTS "${funcInsertName}"();
`;

export default { up, down };