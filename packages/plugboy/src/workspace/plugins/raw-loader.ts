import { Plugin } from '../../types';
import fs from 'node:fs/promises';

export const rawLoaderPlugin: Plugin = {
  name: 'raw-loader',
  async resolveId(id, importer, options) {
    if (!id.endsWith('?raw')) return null;

    const rawPath = id.slice(0, -4); // remove '?raw'

    // Resolve a relative path to an absolute path
    const resolved = await this.resolve(rawPath, importer, {
      ...options,
      skipSelf: true,
    });

    if (!resolved) return null;

    // Return the resolved absolute path with a marker
    return `\0raw:${resolved.id}`;
  },

  async load(id) {
    if (!id.startsWith('\0raw:')) return null;

    const realPath = id.slice(5); // remove '\0raw:'
    const content = await fs.readFile(realPath, 'utf-8');
    return `export default ${JSON.stringify(content)};`;
  },
};
