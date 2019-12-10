import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const port = process.env.ACCOUNT_SERVER_PORT || 8081;

const corsOptions = {
  origin: '*',
  exposedHeaders: ['Access-Token', 'Refresh-Token']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/', routes);
app.use((err, req, res, next) => console.error(err) || res.status(422).send(err.message));

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
