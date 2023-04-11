module.exports = {
  extends: ['@fastkit/stylelint-config'],
  ignoreFiles: [
    '!.eslintrc.js',
    '/node_modules/',
    '**/node_modules/',
    '**/coverage/**/*',
    '**/dist/**/*',
    '**/.dynamic/**/*',
    '.vui',
    '**/dist/',
    '**/*.ts',
    'docs/**/*',
    '**/.git/**/*',
  ],
};
