import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintHtmlParser from 'eslint-html-parser';
import tseslint from 'typescript-eslint';
import { fastkitRules } from './shared.mjs';

export default [
  {
    name: 'ignore for test',
    files: ['**/__tests__/**', 'test-dts/**'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-syntax': 'off',
    },
  },
  ...tseslint.configs.recommended,
  {
    name: 'fastkitRules',
    rules: fastkitRules,
  },
  {
    ignores: ['**/dist/', '**/coverage/'],
  },
  eslintConfigPrettier,
];
