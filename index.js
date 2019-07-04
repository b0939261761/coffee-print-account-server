'use strict';

const express = require('express');

const app = express();
const port = 8081;

app.get('/', (req, res) => res.send('Whimsy-account'));
app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
