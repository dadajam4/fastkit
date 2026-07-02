import { Plugin } from '../../types';
import type { PlugboyWorkspace } from '../workspace';

/**
 * A specifier is "bare" (a package specifier) when it is not relative, absolute,
 * a protocol-qualified id (`node:`, `data:`, `http:`, …) or a fragment. Only
 * bare specifiers are candidates for external resolution here.
 */
function isBareSpecifier(id: string): boolean {
  return !/^(?:\.{1,2}\/|\/|[a-z][a-z\d+.-]*:|#)/i.test(id);
}

/** Whether `id` equals `name` or is a subpath of it (`name/...`). */
function matchesPackage(id: string, name: string): boolean {
  return id === name || id.startsWith(`${name}/`);
}

/**
 * Resolve self-references and `deps.neverBundle` package imports as explicit
 * externals.
 *
 * rolldown only externalizes a specifier without warning when it matches the
 * `external` option *before* it tries to resolve it on disk. A `deps.neverBundle`
 * entry is a plain string, so it matches the package name exactly but not its
 * subpaths (`pkg/foo.svg`); and a package's own name is never in its
 * dependencies at all. Both therefore fall through to rolldown's
 * "resolve failed → implicit external" path, which emits a noisy
 * `UNRESOLVED_IMPORT` warning for every such import even though the resulting
 * external output is correct.
 *
 * This plugin intercepts those imports in `resolveId` and marks them external
 * up front, so the diagnostic never fires:
 *
 * - **Self-reference:** a package importing its own name (or a subpath of it).
 *   The subpath is served at runtime from the consumer's `exports` map
 *   (`"./*": "./dist/*"`); it cannot — and must not — be bundled into the build
 *   that produces that very `dist`, so external is always the right answer.
 * - **`deps.neverBundle`:** the declared package names and any of their
 *   subpaths.
 *
 * Specifiers that match neither are returned untouched, so genuine unresolved
 * imports (typos in a non-external package) still surface their warning.
 */
export function createExternalImportsPlugin(
  workspace: PlugboyWorkspace,
): Plugin {
  const selfName = workspace.json.name;
  const { neverBundlePrefixes } = workspace;

  return {
    name: 'plugboy:external-imports',
    resolveId(id) {
      if (!isBareSpecifier(id)) return null;

      if (selfName && matchesPackage(id, selfName)) {
        return { id, external: true };
      }

      for (const prefix of neverBundlePrefixes) {
        if (matchesPackage(id, prefix)) {
          return { id, external: true };
        }
      }

      return null;
    },
  };
}
