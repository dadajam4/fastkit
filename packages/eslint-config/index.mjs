import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintHtmlParser from 'eslint-html-parser';
import tseslint from 'typescript-eslint';
import { fastkitRules } from './shared.mjs';

export { tseslint };

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
  // Turn off ESLint's own formatting rules so they never fight a formatter.
  // This config intentionally does NOT format: pick and run whatever you like
  // on your side (Prettier CLI, editor format-on-save, dprint, Biome, or
  // eslint-plugin-prettier if you prefer formatting through ESLint).
  //
  // `eslint-config-prettier` is the de-facto tool for this: ESLint ships no
  // official "disable all formatting rules" preset, and its core formatting
  // rules are deprecated/frozen (since v8.53). It also turns off plugin-side
  // formatting rules (e.g. eslint-plugin-vue's), which `@stylistic`'s
  // disable-legacy config does not cover.
  eslintConfigPrettier,
];
