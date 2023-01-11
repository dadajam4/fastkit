import { Plugin } from 'vite';

export function globalsPlugin(options = {}): Plugin {
  return {
    name: 'playground:globals',
    transform(code, id, options = {}) {
      if (/\.[jt]sx?$/.test(id)) {
        const values = {
          'process.env.NODE_ENV': JSON.stringify('production'),
          __PLAY__: true,
          __COMMIT__: JSON.stringify('---'),
          __TEST__: false,
          __DEV__: true,
          __ESM_BUNDLER__: false,
          __VERSION__: JSON.stringify('0.0.0'),
          // __NODE_JS__: options.ssr,
        };
        Object.entries(values).forEach(([key, value]) => {
          code = code.replace(new RegExp(key, 'g'), JSON.stringify(value));
        });
        return { code };
      }
      return null;
    },
  };
}
