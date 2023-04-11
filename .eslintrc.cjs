module.exports = {
  root: true,
  extends: ['@fastkit/eslint-config'],
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
