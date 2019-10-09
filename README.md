# Coffee print account

```bash
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:migrate'
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:seed:all'

# Revert migration
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:migrate:undo'
```

Обновление на новую версию:

```sql
--Обновление таблицы миграций
DELETE FROM "SequelizeMeta";

INSERT INTO "SequelizeMeta" ("name")
VALUES
  ('20190701000000-create-trigger-update_at_timestamp.js'),
  ('20190702000000-create-role.js'),
  ('20190703000000-create-users.js'),
  ('20190704000000-create-cartridge.js'),
  ('20190705000000-create-device.js'),
  ('20190706000000-create-statistic.js');

-- Добавление таблицы ролей
CREATE TABLE IF NOT EXISTS "Roles" ("id"   SERIAL , "name" VARCHAR(40) NOT NULL DEFAULT '', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("id"));

CREATE TRIGGER "Roles_update_at"
  BEFORE UPDATE ON "Roles"
    FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();

INSERT INTO "Roles" (name) VALUES ('admin'), ('trader'), ('dealer'), ('customer');

-- Добавление таблицы пользователей
CREATE TABLE IF NOT EXISTS "Users" ("id"   SERIAL , "email" VARCHAR(100) NOT NULL DEFAULT '' UNIQUE, "salt" VARCHAR(32) NOT NULL DEFAULT '', "hash" VARCHAR(128) NOT NULL DEFAULT '', "token" VARCHAR(254) NOT NULL DEFAULT '', "parentId" INTEGER REFERENCES "Users" ("id") ON DELETE CASCADE, "roleId" INTEGER NOT NULL REFERENCES "Roles" ("id") ON DELETE CASCADE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY ("id"));

CREATE TRIGGER "Users_update_at"
  BEFORE UPDATE ON "Users"
    FOR EACH ROW EXECUTE PROCEDURE update_at_timestamp();

INSERT INTO "Users" (email, "roleId", salt, hash)
  VALUES ('admin', 1, 'b63a3522012a67501d1da3f4eb939fa1', '308ce43cce240d806560c0729b03261e24d6569d74eb957ed7bad9aa36b8571d0981587cbc2a9b766fd78387c96fc12fc471dceec9a67a8aebf68d202c9bd266');

-- Добавление поля а таблицу устройств
ALTER TABLE "Devices" ADD "userId" int4 NULL;

ALTER TABLE "Devices" ADD CONSTRAINT "Devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;

-- Добавление поля а таблицу картриджей
ALTER TABLE "Cartridges" ADD "userId" int4 NULL;

ALTER TABLE "Cartridges" ADD CONSTRAINT "Cartridges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;
```
