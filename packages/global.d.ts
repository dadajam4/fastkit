// Global compile-time constants
declare let __PLAY__: boolean;
declare let __DEV__: boolean;
declare let __TEST__: boolean;
declare let __ESM_BUNDLER__: boolean;
// declare let __NODE_JS__: boolean;
declare let __COMMIT__: string;
declare let __VERSION__: string;
declare let __CONTAINER_ID__: string;
declare let __VOT_BASE__: string | undefined;
declare let __VOT_GENERATE__: boolean;

declare module '*.css!raw' {
  const rawStyle: string;
  export default rawStyle;
}

declare module '*.scss!raw' {
  const rawStyle: string;
  export default rawStyle;
}
