module.exports = {
  extends: ['@fastkit/eslint-config'],
  overrides: [
    {
      files: [
        '*.ts',
        '*.tsx',
        '*.mts',
        '*.cts',
        '*.js',
        '*.cjs',
        '*.jsx',
        '*.mjs',
        '*.vue',
      ],
      extends: ['plugin:vue/vue3-recommended'],
      parser: 'vue-eslint-parser',
      rules: {
        'vue/one-component-per-file': 'off',
        'vue/require-explicit-emits': 'off',
        'vue/require-default-prop': 'off',
      },
    },
    {
      files: [
        '**/pages/**/*.{js,ts,vue}',
        '**/layouts/**/*.{js,ts,vue}',
        '**/app.{js,ts,vue}',
        '**/error.{js,ts,vue}',
      ],
      rules: { 'vue/multi-word-component-names': 'off' },
    },
    {
      files: ['**/pages/**/*.{js,ts,vue}', '**/layouts/**/*.{js,ts,vue}'],
      rules: { 'vue/no-multiple-template-root': 'error' },
    },
  ],
};
