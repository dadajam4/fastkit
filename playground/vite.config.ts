import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import viteSSR from 'vite-ssr/plugin';
import { viteVuiPlugin } from '@fastkit/vui/dist/tool';

const viteVui = viteVuiPlugin();

export default defineConfig({
  root: __dirname,
  server: {
    host: '0.0.0.0',
  },
  plugins: [viteSSR(), vue(), vueJsx(), ...viteVui.plugins],
});
