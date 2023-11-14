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
    resolveId(id, importer) {
      if (filter(id) && importer) {
        if (JSON_EXT_MATCH_RE.test(id)) {
          const fromDir = path.dirname(importer);
          const absolutePath = path.resolve(fromDir, id);
          const resolvedId =
            RESOLVED_VIRTUAL_MODULE_ID_PREFIX +
            absolutePath.replace(JSON_EXT_MATCH_RE, '');
          return resolvedId;
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

      const sourceFilePath = _id.endsWith('.ts') ? _id : _id + '.ts';
      const workspace = Workspace.getBySourceFilePath(sourceFilePath);
      const result = workspace.createSourceFileExports(sourceFilePath);

      // const footer = `
      //   if (import.meta.hot) {
      //     import.meta.hot.accept((newModule) => {});

      //     import.meta.hot.dispose((data) => {});

      //     import.meta.hot.prune((data) => {});
      //   }
      // `;
      const footer = ``;

      EntryWatcher.isAvailable && EntryWatcher.init(id, workspace);
      // workspace.updateWatcherDependencies
      // entry.setDependencies(result.dependencies);

      return {
        code: isJSON
          ? `export default ${JSON.stringify(result)};\n${footer}`
          : generateModuleCode(result),
      };
    },
  };
}
