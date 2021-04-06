module.exports = {
  semi: false,
  trailingComma: "all",
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  jsxBracketSameLine: true,
  proseWrap: 'preserve',
  endOfLine:"auto",
  overrides: [
    {
      "files": "*.html",
      "options": {
        "parser":"html"
      }
    },
    {
      "files": "*.scss",
      "options": {
        "singleQuote": false
      }
    },
  ],
};
