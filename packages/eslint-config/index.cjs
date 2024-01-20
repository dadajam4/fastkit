const prettier = require('eslint-config-prettier');
const { fastkitRules } = require('./shared.cjs');

module.exports = {
  extends: ['prettier'],
  overrides: [
    // tests, no restrictions (runs in Node / jest with jsdom)
    {
      files: ['**/__tests__/**', 'test-dts/**'],
      rules: {
        'no-restricted-globals': 'off',
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['*.html'],
      parser: 'eslint-html-parser',
    },
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
      ],
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
        'prettier',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        parser: '@typescript-eslint/parser', // Specifies the ESLint parser
        ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
          // tsx: true, // Allows for the parsing of JSX
          jsx: true,
        },
      },
      rules: {
        ...fastkitRules,
        ...prettier.rules,
      },
    },
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
        '.stylelintrc.{js,cjs}',
        '.prettierrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
    {
      files: ['*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      env: {
        node: true,
      },
      files: [
        '**/.eslintrc.{js,cjs}',
        '**/.stylelintrc.{js,cjs}',
        '**/.prettierrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        semi: true,
        endOfLine: 'auto',
      },
    ],
  },
  ignorePatterns: ['**/dist/', '**/coverage/'],
};
