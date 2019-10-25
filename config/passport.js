const passport = require('passport');
const LocalStrategy = require('passport-local');

passport.use(new LocalStrategy({
  usernameField: 'user[email]',
  passwordField: 'user[password]'
}, (email, password, done) => {
  if (!email || !password) {
    return done(null, false, { errors: { 'email or password': 'is invalid' } });
  }

  return done(null, { email });
}));
