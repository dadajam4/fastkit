import { defineProjectConfig } from '@fastkit/plugboy';
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';
import { createVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';

const eslintScripts = {
  eslint: 'eslint . --ext ts,tsx,js,vue,html,yaml',
  'eslint:fix': 'eslint . --ext ts,tsx,js,vue,html,yaml --fix',
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

export default defineProjectConfig({
  peerDependencies: {
    vue: '^3.2.0',
    'vue-router': '^4.1.0',
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
    createVueJSXPlugin(),
  ],
});
