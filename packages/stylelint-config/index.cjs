module.exports = {
  // syntax: 'css-in-js',
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-standard',
    'stylelint-prettier/recommended',
    'stylelint-config-prettier',
    'stylelint-config-recess-order',
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
    'prettier/prettier': true,
    indentation: 2,
    'string-quotes': 'single',
    'length-zero-no-unit': null,
    'value-keyword-case': null,
    'no-descending-specificity': null,
    'declaration-block-trailing-semicolon': null,
    'alpha-value-notation': 'number',
    'color-function-notation': null,
    'selector-class-pattern': null,
    'custom-property-pattern': null,
    'number-max-precision': 16,
    'import-notation': null,

    // Allow use of implicit scss global methods
    'function-no-unknown': null,
    // 'function-calc-no-unspaced-operator': false,
    // 'function-linear-gradient-no-nonstandard-direction': false,
    // 'function-calc-no-invalid': null,
  },
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
    {
      files: ['**/*.html'],
      customSyntax: 'postcss-html',
    },
  ],
};
