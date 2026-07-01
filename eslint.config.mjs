import vueConfig from '@fastkit/eslint-config-vue';
// The shared config only disables formatting rules; it does not format. This
// repo chooses to format through ESLint, so it adds eslint-plugin-prettier here
// (using the repo's own Prettier).
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';

export default [
  ...vueConfig,
  {
    rules: {
      'no-console': 'error',
    },
  },
  {
    // ignoreファイルの設定（.eslintignore相当）
    ignores: [
      '/node_modules/',
      '**/node_modules/',
      '/coverage/',
      '/dist/',
      '/play.ts',
      '**/dist/',
      '**/.vui/',
      '**/vui.d.ts',
      '**/*.bundled_*.mjs',
    ],
  },
  eslintPluginPrettier,
];
