import { connection, sql } from './database.js';

// ------------------------------

export const getRoles = async roleId => (await connection.query(sql`
  SELECT id, name FROM "Roles" WHERE id > ${roleId} ORDER BY id
`)).rows;

// ------------------------------

export default {
  getRoles
};
