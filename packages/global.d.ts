// Global compile-time constants
declare let __DEV__: boolean;
declare let __TEST__: boolean;
declare let __BROWSER__: boolean;
declare let __GLOBAL__: boolean;
declare let __ESM_BUNDLER__: boolean;
declare let __ESM_BROWSER__: boolean;
declare let __NODE_JS__: boolean;
declare let __COMMIT__: string;
declare let __VERSION__: string;

declare module '*.css!raw' {
  const rawStyle: string;
  export default rawStyle;
}

declare module '*.scss!raw' {
  const rawStyle: string;
  export default rawStyle;
}

declare module 'cssnano' {
  import { PluginCreator } from 'postcss';
  const cssnano: PluginCreator<any>;
  export default cssnano;
}
