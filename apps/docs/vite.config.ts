import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { ViteVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin';
import { viteVuiPlugin } from '@fastkit/vite-plugin-vui';
import { votPlugin } from '@fastkit/vot/tool';
import tsconfigPaths from 'vite-tsconfig-paths';
import { PackageLoader } from './modules/package-loader/plugin';
import { MOCK_ITEMS_1 } from './src/pages/vui/index/components/tabs/-tabs';

const USE_GENERATE = true;

const viteVui = viteVuiPlugin({
  colorScheme: './config/color-scheme.ts',
  // onBooted: () => {
  //   console.log('★ onBooted');
  // },
});

export default defineConfig({
  root: __dirname,
  base: '/fastkit/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/google': 'https://google.com',
    },
  },
  plugins: [
    tsconfigPaths(),
    splitVendorChunkPlugin(),
    ViteVanillaExtractPlugin({
      // @TODO
      // If set to short, the selector is not output correctly when Generate is used.
      identifiers: 'debug',
    }),
    PackageLoader(),
    votPlugin({
      pages: {
        exclude: ['**/-*/**/*', '**/-*.*', '**/*.css.ts'],
        onRoutesGenerated(routes) {
          routes.unshift({
            name: 'home',
            path: '/',
            component: '/src/pages/-home.tsx' as any,
            props: true,
          });
        },
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
              if (page.path.endsWith('/vui/components/tabs/:childId')) {
                return MOCK_ITEMS_1.map(({ value }) => ({
                  params: { childId: value },
                }));
              }
            },
            // outputSync: '../docs',
          }
        : undefined,
    }),
    ...viteVui.plugins,
  ],
});
