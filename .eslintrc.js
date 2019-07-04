module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['airbnb-base', 'plugin:node/recommended'],
  rules: {
    // require or disallow trailing commas (comma-dangle)
    'comma-dangle': ['error', 'never'],

    //Require parens in arrow function arguments (arrow-parens)
    'arrow-parens': ['error', 'as-needed'],

    // Require Radix Parameter (radix)
    radix: ['error', 'as-needed'],

    // disallow the use of console (no-console)
    'no-console': ['error', { allow: ['info', 'warn', 'error'] } ],

    // disallow the unary operators ++ and -- (no-plusplus)
    'no-plusplus': 'off',

    "no-unused-vars": ['error', { argsIgnorePattern: '^(req|res|next)$' }],

  },
  parserOptions: {
    parser: 'babel-eslint'
  }
};
