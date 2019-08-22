const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') dotenv.config();

const app = express();
const port = process.env.ACCOUNT_SERVER_PORT || 8081;

app.use(cors());
app.use(express.json());

app.use('/', require('./routes'));

app.use((err, req, res, next) => res.status(422).send(err.message));

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
