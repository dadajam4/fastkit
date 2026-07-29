import fs from 'node:fs/promises';
import path from 'node:path';
import { Plugin } from '../../types';
import type { PlugboyWorkspace } from '../workspace';

/**
 * Plugin that inlines the contents of a `?raw` import.
 *
 * The virtual module id is kept **relative to the workspace** and turned back
 * into a path only inside `load`. rolldown normalizes an ordinary module id
 * against the project when it prints the `//#region <id>` comment that precedes
 * each module in the output, but a virtual id — anything starting with `\0` — is
 * printed verbatim. Building the id from the resolved absolute path therefore
 * published the build machine's directory layout:
 *
 * ```js
 * //#region \0raw:/home/runner/work/acme-ui/acme-ui/packages/core/src/logo.svg
 * ```
 *
 * A workspace-relative id makes the output independent of where the build ran,
 * which also keeps two machines' `dist` diffable.
 */
const PREFIX = '\0raw:';
const SUFFIX = '?raw';

export function createRawLoaderPlugin(workspace: PlugboyWorkspace): Plugin {
  const root = workspace.dir.value;

  return {
    name: 'raw-loader',
    async resolveId(id, importer, options) {
      if (!id.endsWith(SUFFIX)) return null;

      const rawPath = id.slice(0, -SUFFIX.length);

      // Resolve a relative path to an absolute path
      const resolved = await this.resolve(rawPath, importer, {
        ...options,
        skipSelf: true,
      });

      if (!resolved) return null;

      // Posix separators keep the id — and with it the emitted comment —
      // identical on Windows.
      return `${PREFIX}${path
        .relative(root, resolved.id)
        .split(path.sep)
        .join(path.posix.sep)}`;
    },

    async load(id) {
      if (!id.startsWith(PREFIX)) return null;

      const content = await fs.readFile(
        path.resolve(root, id.slice(PREFIX.length)),
        'utf-8',
      );
      return `export default ${JSON.stringify(content)};`;
    },
  };
}
