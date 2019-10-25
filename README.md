# Coffee print account

```bash
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:migrate'
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:seed:all'

# Revert migration
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:migrate:undo'
```

Обновление на новую версию:

```sql

-- Добавление поля а таблицу устройств
ALTER TABLE "Devices" ADD "userId" int4 NULL;

ALTER TABLE "Devices" ADD CONSTRAINT "Devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;

-- Добавление поля а таблицу картриджей
ALTER TABLE "Cartridges" ADD "userId" int4 NULL;

ALTER TABLE "Cartridges" ADD CONSTRAINT "Cartridges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;
```
