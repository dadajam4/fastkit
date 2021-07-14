module.exports = {
  syntax: 'css-in-js',
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-standard',
    'stylelint-prettier/recommended',
    'stylelint-config-prettier',
    'stylelint-config-recess-order',
  ],
  rules: {
    'prettier/prettier': true,
    indentation: 2,
    'string-quotes': 'single',
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': true,
  },
};
