const fastkitRules = {
  'class-methods-use-this': 'off',
  'consistent-return': 'off',
  'max-len': ['error', { ignoreComments: true }],
  'max-classes-per-file': 'off',
  'no-continue': 'off',
  'no-param-reassign': 'off',
  'no-plusplus': 'off',
  'no-unused-expressions': [
    'error',
    {
      allowShortCircuit: true,
      allowTernary: true,
    },
  ],
  'no-restricted-syntax': 'off',
  'no-return-assign': ['error', 'except-parens'],
  'no-use-before-define': 'off', // どうも型引数を勘違いして拾っちゃう
  'no-underscore-dangle': 'off',
  'no-promise-executor-return': 'off',
  'no-restricted-globals': ['error', 'event'],
  'no-return-await': 'off',
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: {
        array: false,
        object: true,
      },
      AssignmentExpression: {
        array: false,
        object: false,
      },
    },
  ],
  'import/no-unresolved': 'off',
  'import/extensions': 'off',
  'import/no-extraneous-dependencies': 'off', // for shamefully-hoist
  'import/prefer-default-export': 'off',
  // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
  // e.g. "@typescript-eslint/explicit-function-return-type": "off",
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-unused-vars': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/no-unsafe-declaration-merging': 'off',
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
};

module.exports = { fastkitRules };
