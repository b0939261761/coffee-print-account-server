# Coffee-print

```bash
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:migrate'
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:seed:all'

# Revert migration
docker-compose run account-server bash -c 'cd $APP_DIR && npx sequelize db:migrate:undo'
```
