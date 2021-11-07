import viteSSRPlugin from 'vite-ssr/plugin';
import Pages, { UserOptions as PagesUserOptions } from 'vite-plugin-pages';
import { Plugin } from 'vite';
import vue, { Options as VuePluginOptions } from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

type VueJsxOptions = Parameters<typeof vueJsx>[0];

type ViteSSRPluginOpts = NonNullable<Parameters<typeof viteSSRPlugin>[0]>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViteRunaPluginOptions extends ViteSSRPluginOpts {
  vue?: VuePluginOptions;
  jsx?: VueJsxOptions;
  pages?: PagesUserOptions;
}

export function viteRunaPlugin(options: ViteRunaPluginOptions = {}) {
  const ssrPlugin = viteSSRPlugin(options);
  const { pages } = options;
  const pagesPlugin = Pages({
    pagesDir: 'src/pages',
    extensions: ['vue', 'ts', 'tsx'],
    ...pages,
  });

  const vuePlugin = vue(options.vue);
  const vueJsxPlugin = vueJsx(options.jsx);

  const plugin: Plugin = {
    name: 'vite:page',
  };
  return [pagesPlugin, ssrPlugin, vuePlugin, vueJsxPlugin, plugin];
}
