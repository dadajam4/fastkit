import { defineConfig } from 'vite';

import { viteVuiPlugin } from '@fastkit/vui/dist/tool';
import { aliasesPlugin } from '../core/playground-aliases';
import { globalsPlugin } from '../core/playground-globals';
import { votPlugin } from '../packages/vot/dist/tool';

const viteVui = viteVuiPlugin({
  __dev: true,
});

export default defineConfig({
  root: __dirname,
  server: {
    host: '0.0.0.0',
    proxy: {
      '/google': 'https://google.com',
    },
  },
  plugins: [globalsPlugin(), aliasesPlugin(), votPlugin(), ...viteVui.plugins],
});
