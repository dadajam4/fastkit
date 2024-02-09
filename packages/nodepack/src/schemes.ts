import type { OnResolveArgs, OnResolveResult } from 'esbuild';

export interface ExternalPluginOptions {
  skipNodeModulesBundle?:
    | boolean
    | ((args: OnResolveArgs) => OnResolveResult | void);
  external?: (string | RegExp)[];
  noExternal?: (string | RegExp)[];
  tsconfigResolvePaths?: Record<string, string[]>;
}

export interface NodepackOptions extends ExternalPluginOptions {
  entry: string;
  dest: string;
  minify?: boolean;
  sourcemap?: boolean;
  target?: string;
  define?: {
    [key: string]: string;
  };
}
