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
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs'],
      extends: [
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      ],
      parser: '@typescript-eslint/parser',
      // parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser', // Specifies the ESLint parser
        ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module', // Allows for the use of imports
        ecmaFeatures: {
          // tsx: true, // Allows for the parsing of JSX
          jsx: true,
        },
      },
      rules: {
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. "@typescript-eslint/explicit-function-return-type": "off",
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-types': [
          'error',
          {
            extendDefaults: true,
            types: {
              '{}': false,
            },
          },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'vue/one-component-per-file': 'off',
        'vue/require-explicit-emits': 'off',
        'vue/require-default-prop': 'off',
        'prettier/prettier': [
          'error',
          {
            semi: true,
            endOfLine: 'auto',
          },
        ],
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
  ignorePatterns: ['/node_modules/', '**/node_modules/', '/dist/', '**/dist/'],
};
