import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Pages from 'vite-plugin-pages';
import { viteVuiPlugin } from '@fastkit/vui/dist/tool';
import { aliasesPlugin } from '../core/playground-aliases';
import { globalsPlugin } from '../core/playground-globals';
// import { vitePagePlugin } from '@fastkit/vite-page/dist/tool';
import { vitePagePlugin } from '../packages/vite-page/dist/tool';

const viteVui = viteVuiPlugin({
  __dev: true,
});

export default defineConfig({
  root: __dirname,
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    globalsPlugin(),
    aliasesPlugin(),
    vitePagePlugin(),
    vue(),
    vueJsx(),
    Pages({
      pagesDir: 'src/pages',
      extensions: ['vue', 'ts', 'tsx'],
    }),
    ...viteVui.plugins,
  ],
});
