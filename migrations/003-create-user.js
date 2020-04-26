// import { cryptoPassword } from '../utils/password';

const tableName = 'Users';

// const { salt, hash } = cryptoPassword('6k3vddrb2v');
const { salt, hash } = { salt: 1, hash: 1 };

const up = `
  CREATE TABLE "${tableName}" (
    id SERIAL PRIMARY KEY,
    "parentId" INTEGER REFERENCES "${tableName}" (id) ON DELETE CASCADE,
    "roleId" INTEGER NOT NULL REFERENCES "Roles" (id) ON DELETE CASCADE,
    email VARCHAR(100) NOT NULL DEFAULT '' UNIQUE,
    salt VARCHAR(32) NOT NULL DEFAULT '',
    hash VARCHAR(128) NOT NULL DEFAULT '',
    token VARCHAR(254) NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TRIGGER "${tableName}UpdateAt"
    BEFORE UPDATE ON "${tableName}"
      FOR EACH ROW EXECUTE PROCEDURE "updateAtTimestamp"();

  INSERT INTO "${tableName}" (email, "roleId", salt, hash)
    VALUES ('admin@whim.sy', 1, '${salt}', '${hash}');
`;

const down = `DROP TABLE IF EXISTS "${tableName}";`

export default { up, down };

