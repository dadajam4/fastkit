module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  useTabs: false,
  arrowParens: 'always',
  bracketSameLine: true,
  proseWrap: 'preserve',
  endOfLine: 'auto',
  overrides: [
    {
      files: '*.html',
      options: {
        parser: 'html',
      },
    },
  ],
};
