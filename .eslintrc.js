const path = require('path');

module.exports = {
  extends: [path.resolve(__dirname, 'packages/eslint-config')],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.vue'],
      extends: ['plugin:vue/vue3-recommended'],
      parser: 'vue-eslint-parser',
      rules: {
        'vue/one-component-per-file': 'off',
        'vue/require-explicit-emits': 'off',
        'vue/require-default-prop': 'off',
      },
    },
  ],
  ignorePatterns: [
    '/node_modules/',
    '**/node_modules/',
    '/coverage/',
    '/dist/',
    '/play.ts',
    '**/dist/',
    '**/.vui/',
    '**/vui.d.ts',
    '**/vui.d.ts',
    'docs/',
  ],
};
