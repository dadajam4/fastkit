import type { Plugin } from 'vite';
import type { ViteSsrPluginOptions } from '../config';
import type { SsrOptions } from './dev/server';
import { createSSRDevHandler } from './dev/server';

const pluginName = 'vite-ssr';
// const entryServer = '/entry-server';
// const entryClient = '/entry-client';

export function ViteSsrPlugin(options: ViteSsrPluginOptions & SsrOptions = {}) {
  const lib = 'vue' as const;

  const plugins = [
    {
      name: pluginName,
      viteSsrOptions: options,
      config(config, env) {
        return {
          define: {
            __CONTAINER_ID__: JSON.stringify(options.containerId || 'app'),
            // Vite 2.6.0 bug: use this
            // instead of import.meta.env.DEV
            // __DEV__: env.mode !== 'production',
          },
          ssr: {
            noExternal: [pluginName],
          },
          server:
            // Avoid displaying 'localhost' in terminal in MacOS:
            // https://github.com/vitejs/vite/issues/5605
            process.platform === 'darwin'
              ? {
                  host: config.server?.host || '127.0.0.1',
                }
              : undefined,
        };
      },
      // configResolved: (config) => {
      //   console.log(config.define);
      //   // const libPath = `/${lib}`;

      //   // console.log(
      //   //   'saiodasioausoi',
      //   //   pluginName + libPath + (config.build.ssr ? entryServer : entryClient),
      //   // );

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
      async configureServer(server) {
        if (process.env.__DEV_MODE_SSR) {
          const handler = createSSRDevHandler(server, options);
          return () => server.middlewares.use(handler);
        }
      },
    },
  ] as Array<Plugin & Record<string, any>>;

  if ((options.excludeSsrComponents || []).length > 0) {
    plugins.push({
      name: pluginName + '-exclude-components',
      enforce: 'pre',
      resolveId(source, importer, ...rest) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const ssr = rest[1] || rest[0]?.ssr; // API changed in Vite 2.7 https://github.com/vitejs/vite/pull/5294

        if (
          ssr &&
          options.excludeSsrComponents?.some((re) => re.test(source))
        ) {
          return this.resolve(
            `${pluginName}/${lib}/ssr-component-mock`,
            importer,
            { skipSelf: true },
          );
        }
      },
    });
  }

  return plugins;
}
