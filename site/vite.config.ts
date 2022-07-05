import { defineConfig, splitVendorChunkPlugin } from 'vite';

import { viteVuiPlugin } from '@fastkit/vui/dist/tool';
import { aliasesPlugin } from '../core/playground-aliases';
import { globalsPlugin } from '../core/playground-globals';
import { votPlugin } from '../packages/vot/dist/tool';
import { MOCK_ITEMS_1 } from './src/pages/vui/index/components/tabs/-tabs';

const USE_GENERATE = true;

const viteVui = viteVuiPlugin({
  __dev: true,
  // onBooted: () => {
  //   console.log('★ onBooted');
  // },
});

export default defineConfig({
  root: __dirname,
  base: '/fastkit/',
  server: {
    host: '0.0.0.0',
    proxy: {
      '/google': 'https://google.com',
    },
  },
  plugins: [
    splitVendorChunkPlugin(),
    globalsPlugin(),
    aliasesPlugin(),
    votPlugin({
      pages: {
        exclude: ['**/-components/*', '**/-*.ts'],
      },
      configureServer({ use }) {
        use('/healthcheck', (req, res) => {
          res.writeHead(200).end();
        });
      },
      generate: USE_GENERATE
        ? {
            handler: (page) => {
              if (!page.dynamicParams) return true;
              if (page.fullPath === '/vui/components/tabs/:childId') {
                return MOCK_ITEMS_1.map(({ value }) => ({
                  params: { childId: value },
                }));
              }
            },
            outputSync: '../docs',
          }
        : undefined,
    }),
    ...viteVui.plugins,
  ],
});
