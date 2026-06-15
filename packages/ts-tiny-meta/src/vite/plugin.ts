import { Plugin } from 'vite';
import path from 'node:path';
import { Workspace } from '../ts';
import { generateModuleCode } from '../exports';
import {
  RESOLVED_VIRTUAL_MODULE_ID_PREFIX,
  JSON_EXT_MATCH_RE,
} from './constants';
import { filter } from './utils';
import { EntryWatcher } from './watcher';

export interface Options {
  isProduction?: boolean;
}

export interface ResolvedOptions extends Options {
  isProduction: boolean;
}

export function ViteTSTinyMeta(): Plugin {
  return {
    name: 'ts-tiny-meta',
    enforce: 'pre',
    configureServer(devServer) {
      EntryWatcher.setServer(devServer);
    },
    async resolveId(id, importer) {
      if (filter(id) && importer) {
        if (JSON_EXT_MATCH_RE.test(id)) {
          // `$types.json` is a virtual module, so it can't be resolved by Vite
          // directly. Resolve its real `$types.ts` sibling through Vite first
          // so that path aliases (tsconfig `paths`, `resolve.alias`, etc.) are
          // applied before we build the virtual module id. This matters because
          // this plugin runs with `enforce: 'pre'`, ahead of Vite's core path
          // resolution — a naive `path.resolve(dirname(importer), id)` would
          // treat an unresolved alias like `@@@/...` as a relative segment and
          // produce a bogus path. Fall back to the naive form for plain
          // relative ids (e.g. when `this.resolve` yields nothing).
          const tsRequest = id.replace(JSON_EXT_MATCH_RE, '.ts');
          const resolved = await this.resolve(tsRequest, importer, {
            skipSelf: true,
          });
          const base = resolved
            ? resolved.id.replace(/\.ts$/, '')
            : path
                .resolve(path.dirname(importer), id)
                .replace(JSON_EXT_MATCH_RE, '');
          return RESOLVED_VIRTUAL_MODULE_ID_PREFIX + base;
        }
      }
      return null;
    },
    transform(code, id) {
      if (!filter(id)) return null;
      return `${code}\n// hash=${Date.now()}`;
    },
    async load(id) {
      if (!filter(id)) return null;

      let isJSON = false;
      let _id = id;
      if (_id.startsWith(RESOLVED_VIRTUAL_MODULE_ID_PREFIX)) {
        isJSON = true;
        _id = _id.replace(RESOLVED_VIRTUAL_MODULE_ID_PREFIX, '');
      }

      const sourceFilePath = _id.endsWith('.ts') ? _id : `${_id}.ts`;
      const workspace = Workspace.getBySourceFilePath(sourceFilePath);
      const result = workspace.createSourceFileExports(sourceFilePath);
      const footer = ``;

      EntryWatcher.isAvailable && EntryWatcher.init(id, workspace);

      return {
        code: isJSON
          ? `export default ${JSON.stringify(result)};\n${footer}`
          : generateModuleCode(result),
      };
    },
  };
}
