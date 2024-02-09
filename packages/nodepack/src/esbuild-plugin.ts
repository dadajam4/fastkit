import type { Plugin } from 'esbuild';
import { ExternalPluginOptions } from './schemes';

// Must not start with "/" or "./" or "../" or "C:\" or be the exact strings ".." or "."
const NON_NODE_MODULE_RE = /^[A-Z]:[\\/]|^\.{0,2}[/]|^\.{1,2}$/;

const ALIAS_LIKE_RE = /^[~@$]+\//;

const tsconfigPathsToRegExp = (paths: Record<string, any>) =>
  Object.keys(paths || {}).map(
    (key) => new RegExp(`^${key.replace(/\*/, '.*')}$`),
  );

const match = (id: string, patterns?: (string | RegExp)[]) => {
  if (!patterns) return false;
  return patterns.some((p) => {
    if (p instanceof RegExp) {
      return p.test(id);
    }
    return id === p || id.startsWith(`${p}/`);
  });
};

export function externalPlugin(opts: ExternalPluginOptions = {}): Plugin {
  const {
    skipNodeModulesBundle = true,
    external,
    noExternal,
    tsconfigResolvePaths,
  } = opts;
  const resolvePatterns = tsconfigPathsToRegExp(tsconfigResolvePaths || {});
  return {
    name: 'external-plugin',
    setup(build) {
      if (skipNodeModulesBundle) {
        build.onResolve({ filter: /.*/ }, (args) => {
          // Resolve `paths` from tsconfig
          if (match(args.path, resolvePatterns)) {
            return;
          }
          // Respect explicit external/noExternal conditions
          if (match(args.path, noExternal)) {
            return;
          }
          if (match(args.path, external)) {
            return { external: true };
          }
          if (ALIAS_LIKE_RE.test(args.path)) {
            return {
              external: false,
            };
          }
          // Exclude any other import that looks like a Node module
          if (!NON_NODE_MODULE_RE.test(args.path)) {
            return {
              path: args.path,
              external: true,
            };
          }
        });
      } else {
        build.onResolve({ filter: /.*/ }, (args) => {
          // Respect explicit external/noExternal conditions
          if (match(args.path, noExternal)) {
            return;
          }
          if (match(args.path, external)) {
            return { external: true };
          }
          if (ALIAS_LIKE_RE.test(args.path)) {
            return {
              external: false,
            };
          }
        });
      }
    },
  };
}
