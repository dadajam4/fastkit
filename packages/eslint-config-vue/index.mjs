import baseConfig from '@fastkit/eslint-config';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default [
  ...baseConfig,
  ...pluginVue.configs['flat/recommended'],
  { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
  {
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        parser: typescriptEslint.parser,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'vue/one-component-per-file': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/require-default-prop': 'off',

      // ↓↓↓ @see https://github.com/nuxt/eslint-config/blob/main/packages/eslint-config/index.js
      'constructor-super': 'off', // ts(2335) & ts(2377)
      'getter-return': 'off', // ts(2378)
      'no-const-assign': 'off', // ts(2588)
      'no-dupe-args': 'off', // ts(2300)
      'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
      'no-dupe-keys': 'off', // ts(1117)
      'no-func-assign': 'off', // ts(2539)
      'no-import-assign': 'off', // ts(2539) & ts(2540)
      'no-new-symbol': 'off', // ts(7009)
      'no-obj-calls': 'off', // ts(2349)
      'no-redeclare': 'off', // ts(2451)
      'no-setter-return': 'off', // ts(2408)
      'no-this-before-super': 'off', // ts(2376)
      'no-undef': 'off', // ts(2304)
      'no-unreachable': 'off', // ts(7027)
      'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
      'valid-typeof': 'off', // ts(2367)
    },
  },
  {
    ignores: ['**/.nuxt/**', '**/.dynamic/**'],
  },
  {
    files: [
      '**/pages/**/*.{vue, jsx,tsx}',
      '**/layouts/**/*.{vue, jsx,tsx}',
      '**/error.{vue, jsx,tsx}',
    ],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  skipFormatting,
];
