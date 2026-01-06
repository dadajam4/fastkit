import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { ViteVanillaExtractPlugin } from '@fastkit/plugboy-vanilla-extract-plugin';
import { viteVuiPlugin } from '@fastkit/vite-plugin-vui';
import { votPlugin } from '@fastkit/vot/tool';
import tsconfigPaths from 'vite-tsconfig-paths';
import { ViteTSTinyMeta } from '@fastkit/ts-tiny-meta/vite';
import { PackageLoader } from './modules/package-loader/plugin';
import { MOCK_ITEMS_1 } from './src/pages/vui/index/components/tabs/-tabs';
// import { ViteVueTinyMeta } from '@fastkit/vue-tiny-meta/vite';

const USE_GENERATE = true;

const viteVui = await viteVuiPlugin({
  colorScheme: './config/color-scheme.ts',
  // onBooted: () => {
  //   console.log('★ onBooted');
  // },
});

export default defineConfig({
  css: {
    devSourcemap: true,
  },
  root: __dirname,
  base: '/fastkit/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/google': 'https://google.com',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules 配下ならパッケージごとに分割する
          if (id.includes('node_modules')) {
            // pnpmの場合は .pnpm ディレクトリ構造を考慮してパッケージ名を抽出する
            const parts = id.split('node_modules/');
            let pkgPath = parts[parts.length - 1]; // 最後のnode_modules以降を取得

            // pnpmの .pnpm/pkg@version/node_modules/pkg 構造の場合
            if (pkgPath.startsWith('.pnpm/')) {
              const pnpmMatch = pkgPath.match(
                /^\.pnpm\/([^/]+)\/node_modules\/(.+)/,
              );
              if (pnpmMatch) {
                pkgPath = pnpmMatch[2]; // パッケージパスを取得
              }
            }

            const segments = pkgPath.split('/');
            const pkgName = segments[0].startsWith('@')
              ? segments.slice(0, 2).join('/')
              : segments[0];
            return `vendor-${pkgName}`;
          }
        },
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    ViteTSTinyMeta(),
    ViteVanillaExtractPlugin({
      // @TODO
      // If set to short, the selector is not output correctly when Generate is used.
      identifiers: 'debug',
    }),
    // ViteVueTinyMeta({
    //   include: ['./src/components/**/*'],
    //   resolvers: {
    //     prop: (prop) => {
    //       console.log(prop.name, prop.sourceFile);
    //     },
    //   },
    // }),
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
  ] as Plugin[],
});
