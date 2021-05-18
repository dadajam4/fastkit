import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { PACKAGES_DIR, targets } from './core/utils';
import { globalsPlugin } from './plugins/playground-globals';
import { rawStylesPlugin } from './plugins/raw-styles';
import { colorSchemeVitePlugin } from './packages/color-scheme/src/tool';

const fastkitAliases = Object.fromEntries(
  targets.map((target) => {
    const id = target === 'fastkit' ? 'fastkit/' : `@fastkit/${target}/`;
    return [id, `${PACKAGES_DIR.join(target)}/src/`];
  }),
);

const viteSSR = require('vite-ssr/plugin');

const PLAYGROUND_DIR = PACKAGES_DIR.join('playground');
const DYNAMIC_DEST_DIR = path.join(PLAYGROUND_DIR, '.dynamic');

export default defineConfig({
  root: path.resolve(__dirname, 'packages/playground'),
  resolve: {
    alias: {
      '~/': `${path.join(PLAYGROUND_DIR, 'src')}/`,
      ...fastkitAliases,
    },
  },
  plugins: [
    globalsPlugin(),
    viteSSR(),
    vueJsx({
      transformOn: true,
    }),
    vue(),
    rawStylesPlugin(),
    colorSchemeVitePlugin({
      src: './packages/playground/src/color-scheme',
      dest: DYNAMIC_DEST_DIR,
    }),
  ],
});
