import { Plugin } from 'vite';
import babel from '@babel/core';

export function globalsPlugin(options = {}): Plugin {
  // let needHmr = false;
  let needSourceMap = true;
  return {
    name: 'globals',
    config(config, env) {
      return {
        define: {
          __COMMIT__: JSON.stringify('---'),
          __GLOBAL__: false,
          __TEST__: false,
          __DEV__: true,
          __ESM_BUNDLER__: false,
          __ESM_BROWSER__: false,
          __VERSION__: JSON.stringify('0.0.0'),
          ...config.define,
        },
      };
    },
    configResolved(config) {
      // needHmr = config.command === 'serve' && !config.isProduction;
      needSourceMap = config.command === 'serve' || !!config.build.sourcemap;
    },
    transform(code, id, ssr) {
      if (/\.[jt]sx?$/.test(id)) {
        const result = babel.transformSync(code, {
          babelrc: false,
          ast: true,
          plugins: [
            [
              'transform-define',
              {
                'process.env.NODE_ENV': 'production',
                __BROWSER__: !ssr,
                __NODE_JS__: ssr,
              },
            ],
          ],
          sourceMaps: needSourceMap,
          sourceFileName: id,
          configFile: false,
        });

        if (result && result.code) {
          return {
            code: result.code,
            map: result.map,
          };
        }
      }
      return null;
    },
  };
}
