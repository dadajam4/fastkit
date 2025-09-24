/** @type {import('stylelint').Config} */
export default {
  extends: ['@fastkit/stylelint-config-vue', 'stylelint-prettier/recommended'],
  rules: {
    'block-no-redundant-nested-style-rules': null,
  },
  ignoreFiles: [
    '!eslint.config.mjs',
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
