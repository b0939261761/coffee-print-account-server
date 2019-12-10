import express from 'express';
import verifyToken from './verifyToken.js';
import auth from './auth.js';
import devices from './devices.js';
import users from './users.js';
import roles from './roles.js';
import statistics from './statistics.js';
import cartridges from './cartridges.js';
import legacyCartridges from './legacyCartridges.js';

const routes = express.Router();

routes.get('', (req, res) => res.end('Welcome'));
routes.use('/auth', auth);
routes.use('/statistics', statistics);
routes.use('/cartridges', legacyCartridges);

routes.use(verifyToken);

routes.use('/cartridges', cartridges);
routes.use('/devices', devices);
routes.use('/users', users);
routes.use('/roles', roles);

export default routes;
