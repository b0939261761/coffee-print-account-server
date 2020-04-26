const tableName = 'Statistics';
const funcUpdateName = `${tableName}Update`;

const up = `
  CREATE TABLE "${tableName}" (
    id SERIAL PRIMARY KEY,
    "deviceId" INTEGER NOT NULL REFERENCES "Devices" (id) ON DELETE CASCADE,
    "cartridgeId" INTEGER NOT NULL REFERENCES "Cartridges" (id) ON DELETE CASCADE,
    "datePrinted" DATE NOT NULL DEFAULT CURRENT_DATE,
    "quantityPrinted" INTEGER NOT NULL DEFAULT 0,
    "lastActive" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("deviceId", "cartridgeId", "datePrinted")
  );

  CREATE TRIGGER "${tableName}UpdateAt"
    BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

  CREATE OR REPLACE FUNCTION "${funcUpdateName}"() RETURNS TRIGGER AS $$
    BEGIN
      IF NEW."quantityPrinted" > 0 THEN
        NEW."quantityPrinted" := NEW."quantityPrinted" + OLD."quantityPrinted";
        NEW."lastActive" := CURRENT_TIMESTAMP;
      ELSE
        NEW."quantityPrinted" := OLD."quantityPrinted";
      END IF;
      RETURN NEW;
    END;
  $$ LANGUAGE PLPGSQL;

  CREATE TRIGGER "${tableName}Update"
    BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW
        WHEN (NEW."quantityPrinted" IS NOT NULL OR NEW."lastActive" IS NOT NULL)
      EXECUTE PROCEDURE "${funcUpdateName}"();
`;

const down = `
  DROP TABLE IF EXISTS "${tableName}";
  DROP FUNCTION IF EXISTS "${funcUpdateName}"();
`;

export default { up, down };