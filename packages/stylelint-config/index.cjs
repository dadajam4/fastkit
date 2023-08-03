module.exports = {
  // syntax: 'css-in-js',
  extends: [
    'stylelint-config-standard',
    'stylelint-prettier/recommended',
    'stylelint-config-standard-scss',
    'stylelint-config-recess-order',
  ],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
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
    'scss/no-global-function-names': null,
  },
  // overrides: [
  //   {
  //     files: ['**/*.scss'],
  //     customSyntax: 'postcss-scss',
  //   },
  //   {
  //     files: ['**/*.html'],
  //     customSyntax: 'postcss-html',
  //   },
  // ],
};
