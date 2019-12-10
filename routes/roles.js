import express from 'express';
import { catchAsyncRoute } from '../utils/tools.js';
import { getRoles } from '../db/index.js';

const routes = express.Router();

// -- GET ALL ----------------------------------------------------------------

routes.get('', catchAsyncRoute(async (req, res) => res.json(await getRoles(req.user.roleId))));

export default routes;
