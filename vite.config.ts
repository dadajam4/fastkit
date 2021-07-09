import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { PACKAGES_DIR, targets } from './core/utils';
import { globalsPlugin } from './plugins/playground-globals';
import { rawStylesPlugin } from './plugins/raw-styles';
import { dynamicSrcVitePlugin } from './packages/vite-kit/src';

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
  // optimizeDeps: {
  //   include: ['imagemin'],
  // },
  plugins: [
    globalsPlugin(),
    viteSSR(),
    vueJsx({
      transformOn: true,
    }),
    vue(),
    rawStylesPlugin(),
    dynamicSrcVitePlugin({
      colorScheme: {
        src: './packages/playground/src/config/color-scheme',
        dest: path.join(DYNAMIC_DEST_DIR, 'color-scheme'),
      },
      mediaMatch: {
        src: './packages/playground/src/config/media-match',
        dest: path.join(DYNAMIC_DEST_DIR, 'media-match'),
      },
      iconFont: {
        inputDir: './packages/playground/src/config/icon-font/svg',
        outputDir: path.join(DYNAMIC_DEST_DIR, 'icon-font'),
      },
      spriteImages: {
        src: './packages/playground/src/config/sprites',
        dest: path.join(DYNAMIC_DEST_DIR, 'sprites'),
      },
      hashedSync: {
        src: './packages/playground/src/config/sprites',
        dest: path.join(DYNAMIC_DEST_DIR, 'sync'),
      },
    }),
  ],
});
