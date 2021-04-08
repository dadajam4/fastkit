import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { PACKAGES_DIR, targets } from './core/utils';
import { globalsPlugin } from './plugins/playground-globals';
import { rawStylesPlugin } from './plugins/raw-styles';

const fastkitAliases = Object.fromEntries(
  targets.map((target) => {
    const id = target === 'fastkit' ? 'fastkit/' : `@fastkit/${target}/`;
    return [id, `${PACKAGES_DIR.join(target)}/src/`];
  }),
);

const viteSSR = require('vite-ssr/plugin');

// const PACKAGES_DIR = path.resolve(__dirname, 'packages');
const PLAYGROUND_DIR = PACKAGES_DIR.join('playground');

export default defineConfig({
  root: path.resolve(__dirname, 'packages/playground'),
  resolve: {
    alias: {
      '~/': `${path.join(PLAYGROUND_DIR, 'src')}/`,
      // '@fastkit/': `${path.join(PACKAGES_DIR, 'src')}/`,
      ...fastkitAliases,
    },
  },
  plugins: [viteSSR(), vueJsx(), vue(), globalsPlugin(), rawStylesPlugin()],
});
