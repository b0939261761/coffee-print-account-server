const tableName = 'Devices';

const generateCode = index => `('1${(index + 1).toString().padStart(4, '0')}')`
const devices = Array.from({ length: 1000 }, (_, i) => generateCode(i));

const up = `
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
`;

const down = `DROP TABLE IF EXISTS "${tableName}";`;

export default { up, down };