import Pages from 'vite-plugin-pages';
import { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { VotPluginOptions } from '../vot';
import { createSSRDevHandler } from './dev/server';

export * from './build';
export * from './generate';
export * from './dev';
export * from './cli';
export * from '../vot';

export function votPlugin(options: VotPluginOptions = {}) {
  const { pages, configureServer } = options;

  // @FIXME Not default exported on the CJS side for some reason.
  const _Pages: typeof Pages =
    typeof Pages === 'function' ? Pages : (Pages as any).default;
  const pagesPlugin = _Pages({
    dirs: ['src/pages'],
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
          __VOT_CONTAINER_ID__: JSON.stringify(options.containerId || 'app'),
          __VOT_BASE__: JSON.stringify(config.base || '/'),
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
          // exclude: ['virtual:generated-pages', '@fastkit/vot'],
          exclude: ['virtual:generated-pages'],
        },
      };
    },
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

  (plugin as any).__options__ = options;

  // if (configureServer) {
  //   plugin.configureServer = function (server) {
  //     const { middlewares } = server;
  //     const use = middlewares.use.bind(middlewares);
  //     return configureServer({ use });
  //   };
  // }

  // Vue 3.5.40 removed the `vue` peerDependency from @vue/server-renderer and
  // made @vue/runtime-dom a plain dependency instead (vuejs/core#15063). The SSR
  // build keeps `vue` external while bundling @vue/*, so server-renderer would
  // pull in its own copy of the runtime and Vue would end up loaded twice in a
  // single process — rendering then dies on a null `currentRenderingInstance`
  // ("resolveDirective can only be used in render() or setup()"). `vue`
  // re-exports every symbol server-renderer takes from @vue/runtime-dom, so
  // sending the import back to `vue` restores the single-instance topology that
  // Vue itself relied on up to 3.5.39.
  const vueRuntimeDomPlugin: Plugin = {
    name: 'vite:vot-vue-runtime-dom',
    enforce: 'pre',
    resolveId(source, importer, { ssr }) {
      if (!ssr || source !== '@vue/runtime-dom') return;
      // `vue` re-exports @vue/runtime-dom itself, so redirecting its own import
      // would be a cycle. This only shows up once `vue` stops being external
      // (e.g. a consumer adding it to `ssr.noExternal`).
      if (importer && /[\\/]node_modules[\\/]vue[\\/]/.test(importer)) return;
      return this.resolve('vue', importer, { skipSelf: true });
    },
  };

  const plugins = [
    pagesPlugin,
    vuePlugin,
    vueJsxPlugin,
    vueRuntimeDomPlugin,
    plugin,
  ];

  if ((options.excludeSsrComponents || []).length > 0) {
    const plugin: Plugin = {
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
    };
    plugins.push(plugin);
  }

  return plugins;
}
