import { Plugin } from 'vite';
// import babel from '@babel/core';

export function globalsPlugin(options = {}): Plugin {
  // let needHmr = false;
  // let needSourceMap = true;
  return {
    name: 'globals',
    // config(config, env) {
    //   console.log(env);
    //   return {
    //     // define: {
    //     //   __COMMIT__: JSON.stringify('---'),
    //     //   __GLOBAL__: false,
    //     //   __TEST__: false,
    //     //   __DEV__: true,
    //     //   __ESM_BUNDLER__: false,
    //     //   __ESM_BROWSER__: false,
    //     //   __VERSION__: JSON.stringify('0.0.0'),
    //     //   // __BROWSER__: `typeof window !== 'undefined'`,
    //     //   // __NODE_JS__: `typeof window === 'undefined'`,
    //     //   __BROWSER__: `__define__BROWSER__`,
    //     //   __NODE_JS__: `__define__NODE_JS__`,
    //     //   ...config.define,
    //     // },
    //   };
    // },
    // configResolved(config) {
    //   // console.log('■', typeof window);
    //   // (config as any).define = {
    //   //   ...config.define,
    //   // };
    //   // config.define = config.define || {};

    //   // needHmr = config.command === 'serve' && !config.isProduction;
    //   needSourceMap = config.command === 'serve' || !!config.build.sourcemap;
    // },
    transform(code, id, ssr) {
      if (/\.[jt]sx?$/.test(id)) {
        const values = {
          'process.env.NODE_ENV': JSON.stringify('production'),
          __COMMIT__: JSON.stringify('---'),
          __GLOBAL__: false,
          __TEST__: false,
          __DEV__: true,
          __ESM_BUNDLER__: false,
          __ESM_BROWSER__: false,
          __VERSION__: JSON.stringify('0.0.0'),
          __BROWSER__: !ssr,
          __NODE_JS__: ssr,
        };
        // let result: string | undefined;
        Object.entries(values).forEach(([key, value]) => {
          code = code.replace(new RegExp(key, 'g'), JSON.stringify(value));
        });
        return { code };

        // console.log('■', code.match('__BROWSER__'));
        // const result = babel.transformSync(code, {
        //   babelrc: false,
        //   ast: true,
        //   plugins: [
        //     [
        //       'transform-define',
        //       {
        //         'process.env.NODE_ENV': 'production',
        //         __COMMIT__: JSON.stringify('---'),
        //         __GLOBAL__: false,
        //         __TEST__: false,
        //         __DEV__: true,
        //         __ESM_BUNDLER__: false,
        //         __ESM_BROWSER__: false,
        //         __VERSION__: JSON.stringify('0.0.0'),
        //         __BROWSER__: !ssr,
        //         __NODE_JS__: ssr,
        //       },
        //     ],
        //   ],
        //   sourceMaps: needSourceMap,
        //   // sourceMaps: false,
        //   sourceFileName: id,
        //   configFile: false,
        // });
        // if (result && result.code) {
        //   return {
        //     code,
        //     // map: needSourceMap ? result.map : undefined,
        //   };
        // }
      }
      return null;
    },
  };
}
