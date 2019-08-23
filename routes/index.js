const routes = require('express').Router();

routes.use('/cartridges', require('./cartridges'));
routes.use('/devices', require('./devices'));

module.exports = routes;
