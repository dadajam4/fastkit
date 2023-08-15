/* eslint-disable no-undef */
module.exports = {
  root: true,
  extends: ['@fastkit/eslint-config'],
  rules: {
    'no-console': 'error',
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
  },
  ignorePatterns: [
    '/node_modules/',
    '**/node_modules/',
    '/coverage/',
    '/dist/',
    '/play.ts',
    '**/dist/',
    '**/.vui/',
    '**/vui.d.ts',
  ],
};
