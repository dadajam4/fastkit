import type { OnResolveArgs, OnResolveResult } from 'esbuild';

export interface NodeExternalPluginOptions {
  skipNodeModulesBundle?:
    | boolean
    | ((args: OnResolveArgs) => OnResolveResult | void);
  patterns?: (string | RegExp)[];
}

export interface NodepackOptions {
  entry: string;
  dest: string;
  minify?: boolean;
  sourcemap?: boolean;
  target?: string;
  define?: {
    [key: string]: string;
  };
  nodeExternals?: NodeExternalPluginOptions;
}
