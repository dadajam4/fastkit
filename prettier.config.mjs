/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
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

export default config;
