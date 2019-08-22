const routes = require('express').Router();

routes.use('/cartridges', require('./cartridges'));

module.exports = routes;
