/* eslint-disable no-console */
import path from 'node:path';
import Pages from 'vite-plugin-pages';
import { Plugin, UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { VotPluginOptions } from '../vot';
import type { VotServerConfig } from '../schema/server';
import { createSSRDevHandler } from './dev/server';
import { loadServerEntry, resolveServerEntryPath } from './server-entry';

export * from './server-entry';
export * from './build';
export * from './generate';
export * from './dev';
export * from './cli';
export * from '../vot';

/**
 * Keys the server entry takes over from Vite's `server` config.
 */
const SERVER_ENTRY_KEYS = ['host', 'port', 'proxy'] as const;

/**
 * Fold the server entry's values into Vite's `server` config.
 *
 * The entry wins, because it is also what `vot serve` reads -- letting
 * `vite.config.ts` win in dev is exactly how a project ends up with dev and
 * production listening on different ports.
 */
function mergeServerEntryConfig(
  userServer: UserConfig['server'],
  entryConfig: VotServerConfig,
  entryPath: string,
): UserConfig['server'] {
  const server: UserConfig['server'] = {};
  const conflicts: string[] = [];

  for (const key of SERVER_ENTRY_KEYS) {
    const value = entryConfig[key];
    if (value === undefined) continue;
    if (userServer?.[key] !== undefined) conflicts.push(key);
    (server as any)[key] = value;
  }

  if (conflicts.length) {
    console.warn(
      `[vot] ${conflicts
        .map((key) => `\`server.${key}\``)
        .join(
          ', ',
        )} ${conflicts.length > 1 ? 'are' : 'is'} set in both vite.config.ts and ${path.basename(
        entryPath,
      )}. The server entry wins -- remove the one in vite.config.ts.`,
    );
  }

  return server;
}

export function votPlugin(options: VotPluginOptions = {}) {
  const { pages, configureServer } = options;

  /**
   * Resolved server entry, populated by the `config()` hook while the
   * development server starts.
   */
  let serverEntryConfig: VotServerConfig | undefined;

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
    async config(config, env) {
      let entryServer: UserConfig['server'];

      // The entry is bundled -- not evaluated -- at build time, so that values
      // it reads from `process.env` come from the machine that runs the app.
      if (env.command === 'serve') {
        const root = config.root ? path.resolve(config.root) : process.cwd();
        const entryPath = resolveServerEntryPath(root, options.server?.entry);

        if (entryPath) {
          // `vot serve` sets this before falling back to loading the Vite
          // config, which is the only way this hook runs outside `vot dev`.
          const isServe = !!process.env.__VOT_SERVE;

          serverEntryConfig = await loadServerEntry(
            entryPath,
            {
              command: isServe ? 'serve' : 'dev',
              dev: !isServe,
              mode: env.mode,
            },
            { root, resolve: config.resolve },
          );

          entryServer = mergeServerEntryConfig(
            config.server,
            serverEntryConfig,
            entryPath,
          );

          if (configureServer && serverEntryConfig.configureServer) {
            console.warn(
              `[vot] \`configureServer\` is set in both votPlugin() and ${path.basename(
                entryPath,
              )}. Both run, votPlugin() first -- move the one in votPlugin() to the server entry.`,
            );
          }
        }
      }

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
        server: {
          // Avoid displaying 'localhost' in terminal in MacOS:
          // https://github.com/vitejs/vite/issues/5605
          ...(process.platform === 'darwin' && entryServer?.host === undefined
            ? { host: config.server?.host || '127.0.0.1' }
            : undefined),
          ...entryServer,
        },
        optimizeDeps: {
          // exclude: ['virtual:generated-pages', '@fastkit/vot'],
          exclude: ['virtual:generated-pages'],
        },
      };
    },
    async configureServer(server) {
      /**
       * dev and serve build the *same* application, through the same adapter.
       * That is the only way `configureServer` can keep its promise that one
       * source line answers at one URL under both (#223) -- and it is why the
       * hook now receives the adapter's app rather than connect's `use`.
       *
       * Proxy rules are the exception: in dev they are merged into Vite's own
       * `server.proxy` (see {@link mergeServerEntryConfig}), which runs well
       * before this, so the adapter is given none here.
       */
      const { nodeAdapter } = await import('../adapters/node');
      const { createDevMiddleware } = await import('./dev/mount');

      const ssr = !!process.env.__DEV_MODE_SSR;
      const handler = ssr
        ? createSSRDevHandler(server, options)
        : async () => undefined;

      const votApp = await nodeAdapter.createApp({
        command: 'dev',
        host: String(server.config.server.host ?? 'localhost'),
        port: server.config.server.port ?? 3000,
        base: server.config.base || '/',
        proxy: [],
        logger: server.config.logger,
        handler,
        configureServer: async ({ app }) => {
          if (configureServer) {
            await configureServer({ app });
          }
          if (serverEntryConfig?.configureServer) {
            await serverEntryConfig.configureServer({ app });
          }
        },
      });

      /**
       * Returning a function defers the mount until after Vite has installed
       * its own middlewares -- but still before its HTML fallback. Mounting any
       * later means the fallback answers every page request first and the
       * catch-all never runs.
       */
      return () => {
        server.middlewares.use(createDevMiddleware(votApp));
      };
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
