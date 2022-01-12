import { ViteSsrPlugin } from './plugin';
import Pages, { UserOptions as PagesUserOptions } from 'vite-plugin-pages';
import { Plugin } from 'vite';
import vue, { Options as VuePluginOptions } from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { Server } from 'connect';

export * from './proxy';
export * from './build';
export * from './dev';
export * from './cli';
export * from './plugin';

type VueJsxOptions = Parameters<typeof vueJsx>[0];

type ViteSSRPluginOpts = NonNullable<Parameters<typeof ViteSsrPlugin>[0]>;

export interface VotConfigureServerContext {
  use: Server['use'];
}

export type VotConfigureServerFn = (
  ctx: VotConfigureServerContext,
) => (() => void) | void | Promise<(() => void) | void>;

export interface VotPluginOptions extends ViteSSRPluginOpts {
  vue?: VuePluginOptions;
  jsx?: VueJsxOptions;
  pages?: PagesUserOptions;
  configureServer?: VotConfigureServerFn;
}

export function votPlugin(options: VotPluginOptions = {}) {
  const ssrPlugin = ViteSsrPlugin(options);
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
    config(config) {
      config.optimizeDeps = config.optimizeDeps || {};
      config.optimizeDeps.exclude = config.optimizeDeps.exclude || [];
      config.optimizeDeps.exclude.push('virtual:generated-pages');
      return config;
    },
  };

  if (configureServer) {
    plugin.configureServer = function (server) {
      const { middlewares } = server;
      const use = middlewares.use.bind(middlewares);
      return configureServer({ use });
    };
  }

  return [pagesPlugin, ...ssrPlugin, vuePlugin, vueJsxPlugin, plugin];
}
