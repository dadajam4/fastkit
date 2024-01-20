require('@rushstack/eslint-patch/modern-module-resolution');

const prettier = require('eslint-config-prettier');
const { fastkitRules } = require('@fastkit/eslint-config/shared');

module.exports = {
  extends: ['@fastkit/eslint-config'],
  plugins: ['prettier'],
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
      plugins: ['prettier'],
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
        'prettier',
      ],
      parser: 'vue-eslint-parser',
      parserOptions: {
        ecmaVersion: 'latest',
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaFeatures: {
          // tsx: true, // Allows for the parsing of JSX
          jsx: true,
        },
      },
      rules: {
        ...fastkitRules,
        'vue/one-component-per-file': 'off',
        'vue/require-explicit-emits': 'off',
        'vue/require-default-prop': 'off',

        // ↓↓↓ @see https://github.com/nuxt/eslint-config/blob/main/packages/eslint-config/index.js
        'constructor-super': 'off', // ts(2335) & ts(2377)
        'getter-return': 'off', // ts(2378)
        'no-const-assign': 'off', // ts(2588)
        'no-dupe-args': 'off', // ts(2300)
        'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
        'no-dupe-keys': 'off', // ts(1117)
        'no-func-assign': 'off', // ts(2539)
        'no-import-assign': 'off', // ts(2539) & ts(2540)
        'no-new-symbol': 'off', // ts(7009)
        'no-obj-calls': 'off', // ts(2349)
        'no-redeclare': 'off', // ts(2451)
        'no-setter-return': 'off', // ts(2408)
        'no-this-before-super': 'off', // ts(2376)
        'no-undef': 'off', // ts(2304)
        'no-unreachable': 'off', // ts(7027)
        'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
        'valid-typeof': 'off', // ts(2367)

        ...prettier.rules,
      },
    },
    {
      files: [
        '**/pages/**/*.{js,ts,jsx,tsx,vue}',
        '**/layouts/**/*.{js,ts,jsx,tsx,vue}',
        '**/app.{js,ts,jsx,tsx,vue}',
        '**/error.{js,ts,jsx,tsx,vue}',
      ],
      rules: { 'vue/multi-word-component-names': 'off' },
    },
    {
      files: [
        '**/pages/**/*.{js,ts,jsx,tsx,vue}',
        '**/layouts/**/*.{js,ts,jsx,tsx,vue}',
      ],
      rules: { 'vue/no-multiple-template-root': 'error' },
    },
  ],
};
