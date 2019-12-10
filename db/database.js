import slonik from 'slonik';
import queryLogging from 'slonik-interceptor-query-logging';

const interceptors = [];
if (process.env.NODE_ENV !== 'production') {
  interceptors.push(queryLogging.createQueryLoggingInterceptor());
}
const connectionString = 'postgres://'
    + `${process.env.ACCOUNT_SERVER_POSTGRES_USER}:${process.env.ACCOUNT_SERVER_POSTGRES_PASSWORD}`
    + `@${process.env.ACCOUNT_SERVER_POSTGRES_HOST}:${process.env.ACCOUNT_SERVER_POSTGRES_PORT}`
    + `/${process.env.ACCOUNT_SERVER_POSTGRES_DB}`;

export const connection = slonik.createPool(connectionString, { interceptors });
export const { sql } = slonik;

export const fragmentTmpUsers = ({ userId, parentId }) => sql`
  RECURSIVE "tmpUsers"(id) AS (
    SELECT id FROM "Users" WHERE id = ${userId} OR "parentId" IS NOT DISTINCT FROM ${parentId}
    UNION ALL
    SELECT "Users".id FROM "Users" INNER JOIN "tmpUsers" ON "Users"."parentId" = "tmpUsers".id
  )
`;

export default {
  connection,
  sql,
  fragmentTmpUsers
};
