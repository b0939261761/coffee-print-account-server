'use strict';

const express = require('express');
const cors = require('cors');


const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);


const app = express();
const port = 8081;

const redisOptions = {
  host: 'localhost',
  port: 6379
};

const sessionMiddleware = session({
  store: new RedisStore(redisOptions),
  secret: 'Luke Skywalker',
  resave: true,
  rolling: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 10 * 60 * 1000,
    httpOnly: true
  }
});

app.use(cors());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(passport.initialize());
// app.use(passport.session());
app.use(session({
  secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false
}));

require('./config/passport');

const authenticate = passport.authenticate('local', { session: true });

app.post('/login', authenticate, (req, res) => {
  res.send('OK');
});

app.listen(port, () => console.info(`💡 App listening on port ${port}!`));
