import viteSSRPlugin from 'vite-ssr/plugin';

type ViteSSRPluginOpts = NonNullable<Parameters<typeof viteSSRPlugin>[0]>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VitePagePluginOptions extends ViteSSRPluginOpts {}

export function vitePagePlugin(options?: ViteSSRPluginOpts) {
  return viteSSRPlugin(options);
}
