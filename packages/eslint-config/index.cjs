// eslint-disable-next-line no-undef
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
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      ],
      parser: '@typescript-eslint/parser',
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
        'no-console': 'error',
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
