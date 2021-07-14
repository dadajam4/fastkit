const path = require('path');

module.exports = {
  extends: [path.resolve(__dirname, 'packages/stylelint-config')],
  ignoreFiles: [
    '!.eslintrc.js',
    '/node_modules/',
    '**/node_modules/',
    '/coverage/',
    '/dist/',
    '**/dist/',
    '**/*.ts'
  ],
};
