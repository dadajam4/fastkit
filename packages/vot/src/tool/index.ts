import Pages from 'vite-plugin-pages';
import { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { VotPluginOptions } from '../vot';
import { createSSRDevHandler } from './dev/server';

export * from './proxy';
export * from './build';
export * from './dev';
export * from './cli';
export * from '../vot';

export function votPlugin(options: VotPluginOptions = {}) {
  const { pages, configureServer } = options;
  const pagesPlugin = Pages({
    pagesDir: 'src/pages',
    extensions: ['vue', 'ts', 'tsx'],
    ...pages,
  });

  const vuePlugin = vue(options.vue);
  const vueJsxPlugin = vueJsx(options.jsx);

  const plugin: Plugin = {
    name: 'vite:vot',
    ...({
      votOptions: options,
    } as any),
    options: (options) => {
      options.onwarn = (warn, defaultHandler) => {
        // Update this package.json to use a subpath pattern like "./*"
        if (
          warn.code === 'UNUSED_EXTERNAL_IMPORT' &&
          warn.names &&
          warn.names.length === 1 &&
          warn.names[0] === 'resolveDirective'
        ) {
          return;
        }
        defaultHandler(warn);
      };
      return options;
    },
    config(config, env) {
      return {
        define: {
          __CONTAINER_ID__: JSON.stringify(options.containerId || 'app'),
          // Vite 2.6.0 bug: use this
          // instead of import.meta.env.DEV
          [`__${'DEV'}__`]: env.mode !== 'production',
        },
        ssr: {
          noExternal: ['@fastkit/vot'],
        },
        server:
          // Avoid displaying 'localhost' in terminal in MacOS:
          // https://github.com/vitejs/vite/issues/5605
          process.platform === 'darwin'
            ? {
                host: config.server?.host || '127.0.0.1',
              }
            : undefined,
        optimizeDeps: {
          exclude: ['virtual:generated-pages'],
        },
      };

      // config.optimizeDeps = config.optimizeDeps || {};
      // config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
      // config.optimizeDeps.exclude.push('virtual:generated-pages');
      // return config;
    },
    // configResolved: (config) => {
    //   // const libPath = `/${lib}`;

    //   // config.resolve.alias.push({
    //   //   find: /^vite-ssr(\/core|\/vue)?$/,
    //   //   replacement:
    //   //     pluginName +
    //   //     libPath +
    //   //     (config.build.ssr ? entryServer : entryClient),
    //   //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   //   // @ts-ignore
    //   //   _viteSSR: true,
    //   // });

    //   // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //   // // @ts-ignore
    //   // config.optimizeDeps = config.optimizeDeps || {};
    //   // config.optimizeDeps.include = config.optimizeDeps.include || [];
    //   // config.optimizeDeps.include.push(
    //   //   pluginName + libPath + entryClient,
    //   //   pluginName + libPath + entryServer,
    //   // );
    // },
    // resolveId(source, importer, { ssr }) {
    //   console.log('---', source);
    //   return undefined;
    //   // const resolved = this.resolve(
    //   //   `@fastkit/vot/entry-${ssr ? 'server' : 'client'}`,
    //   // );
    //   // return resolved;
    //   // if (
    //   //   ssr &&
    //   //   options.excludeSsrComponents?.some((re) => re.test(source))
    //   // ) {
    //   //   return this.resolve(
    //   //     `${pluginName}/${lib}/ssr-component-mock`,
    //   //     importer,
    //   //     { skipSelf: true },
    //   //   );
    //   // }
    // },
    async configureServer(server) {
      if (configureServer) {
        const { middlewares } = server;
        const use = middlewares.use.bind(middlewares);
        await configureServer({ use });
      }
      if (process.env.__DEV_MODE_SSR) {
        const handler = createSSRDevHandler(server, options);
        return () => server.middlewares.use(handler);
      }
    },
  };

  // if (configureServer) {
  //   plugin.configureServer = function (server) {
  //     const { middlewares } = server;
  //     const use = middlewares.use.bind(middlewares);
  //     return configureServer({ use });
  //   };
  // }

  const plugins = [pagesPlugin, vuePlugin, vueJsxPlugin, plugin];

  if ((options.excludeSsrComponents || []).length > 0) {
    plugins.push({
      name: 'vite:vot-exclude-components',
      enforce: 'pre',
      resolveId(source, importer, { ssr }) {
        if (
          ssr &&
          options.excludeSsrComponents?.some((re) => re.test(source))
        ) {
          return this.resolve(`vite:vot/xxxxx/ssr-component-mock`, importer, {
            skipSelf: true,
          });
        }
      },
    });
  }

  return plugins;
}
