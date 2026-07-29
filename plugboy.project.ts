import { defineProjectConfig } from '@fastkit/plugboy';
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';
import { createVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin';
import { createVuePlugin } from '@fastkit/plugboy-vue-plugin';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';

const eslintScripts = {
  eslint: 'eslint .',
  'eslint:fix': 'eslint . --fix',
};

const stylelintScripts = {
  stylelint: 'stylelint "**/*.{css,scss,vue,html}" --allow-empty-input',
  'stylelint:fix':
    'stylelint "**/*.{css,scss,vue,html}" --fix --allow-empty-input',
};

const baseScripts = {
  build: 'plugboy build',
  clean: 'rm -rf .turbo && rm -rf node_modules && rm -rf dist',
  stub: 'plugboy stub',
  typecheck: 'tsc --noEmit',
  test: 'vitest run',
};

/**
 * The browser support policy of every published package.
 *
 * Baseline "widely available" as of two years ago — a feature qualifies once
 * every major engine has shipped it for ~30 months. These are the lowest
 * versions `browserslist "baseline 2024"` resolves to.
 *
 * Owning the policy here (rather than inheriting whatever a bundler happens to
 * default to) is the point: the same list drives syntax downleveling and the
 * vendor prefixes lightningcss emits, so a build never silently drops e.g. the
 * `-webkit-user-select` Safari still needs.
 *
 * Review periodically — re-resolve with the year two behind the current one:
 *
 * ```bash
 * pnpm dlx browserslist "baseline 2024"
 * ```
 *
 * Last reviewed: 2026-07 (`baseline 2024`).
 */
const BASELINE_WIDELY_AVAILABLE_TARGET = [
  'chrome130',
  'edge130',
  'firefox132',
  'safari18.2',
  'ios18.2',
];

/**
 * The oldest Node.js release still receiving security updates (Node 20 reached
 * end-of-life in April 2026). 22.12 is also the line from which `require(esm)`
 * works, which matters for the ESM-only packages published here.
 */
const NODE_TARGET = 'node22.12';

export default defineProjectConfig({
  peerDependencies: {
    vue: '^3.5.0',
    'vue-router': '^4.4.0 || ^5.0.0',
  },
  scripts: [
    {
      name: 'TypeScript',
      scripts: {
        ...baseScripts,
        ...eslintScripts,
        lint: 'pnpm run eslint',
        format: 'pnpm run eslint:fix',
      },
    },
    {
      name: 'TypeScript with CSS',
      scripts: {
        ...baseScripts,
        ...eslintScripts,
        ...stylelintScripts,
        lint: 'pnpm run "/^(eslint|stylelint)$/"',
        format: 'pnpm run "/^(eslint:fix|stylelint:fix)$/"',
      },
    },
  ],
  tsconfig: {
    extends: '../../tsconfig.base',
    compilerOptions: {
      baseUrl: '.',
      paths: {
        '~/*': ['./src/*'],
      },
    },
  },
  plugins: [
    createSassPlugin(),
    createVanillaExtractPlugin({
      identifiers: 'short',
    }),
    createVuePlugin(),
    createVueJSXPlugin(),
  ],
  // `css.target` is left to inherit this, so the stylesheets are lowered and
  // prefixed for exactly the environments the JavaScript is built for.
  target: [NODE_TARGET, ...BASELINE_WIDELY_AVAILABLE_TARGET],
  optimizeCSS: {
    combineRules: {
      rules: [':root'],
    },
  },
});
