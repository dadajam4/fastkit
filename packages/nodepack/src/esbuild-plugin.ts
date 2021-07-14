import type { Plugin } from 'esbuild';
import { NodeExternalPluginOptions } from './schemes';

const NON_NODE_MODULE_RE = /^[^.\/]|^\.[^.\/]|^\.\.[^\/]/;
const ALIAS_LIKE_RE = /^[~@$]+\//;

export function nodeExternalPlugin(
  opts: NodeExternalPluginOptions = {},
): Plugin {
  const { skipNodeModulesBundle = true, patterns = [] } = opts;
  return {
    name: 'node-external-plugin',
    setup(build) {
      if (skipNodeModulesBundle) {
        build.onResolve({ filter: NON_NODE_MODULE_RE }, (args) => {
          if (ALIAS_LIKE_RE.test(args.path)) {
            return {
              external: false,
            };
          }
          if (typeof skipNodeModulesBundle === 'function') {
            const result = skipNodeModulesBundle(args);
            if (result) return result;
          }
          return {
            path: args.path,
            external: true,
          };
        });
      }

      if (!patterns || patterns.length === 0) return;

      build.onResolve({ filter: /.*/ }, (args) => {
        const external = patterns.some((p) => {
          if (p instanceof RegExp) {
            return p.test(args.path);
          }
          return args.path === p;
        });

        if (external) {
          return { path: args.path, external };
        }
      });
    },
  };
}
