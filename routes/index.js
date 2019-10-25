const routes = require('express').Router();
const verifyToken = require('./verifyToken');

routes.get('', (req, res) => res.end('Welcome'));
routes.use('/auth', require('./auth'));
routes.use('/cartridges', require('./cartridges'));

routes.use(verifyToken);

routes.use('/devices', require('./devices'));
routes.use('/users', require('./users'));
routes.use('/roles', require('./roles'));


module.exports = routes;
