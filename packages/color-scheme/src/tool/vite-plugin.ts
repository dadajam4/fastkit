import { Plugin } from 'vite';
import {
  loadColorScheme,
  // COLOR_SCHEME_LOADER_TYPES,
  // ColorSchemeLoaderType,
} from './loader';
import path from 'path';
import { findPackageDir } from '@fastkit/color';
import chokidar from 'chokidar';
import { ColorSchemeError } from '../logger';
// import { ColorSchemeError } from '../logger';

// const importSuffix = 'color-scheme';

// const idMatchRe = new RegExp(
//   `(\\.(${COLOR_SCHEME_LOADER_TYPES.join('|')}))?!${importSuffix}(\\?import)?$`,
// );

// function parseRawId(rawId: string): {
//   id: string;
//   type: ColorSchemeLoaderType;
// } | void {
//   const match = rawId.match(idMatchRe);
//   if (match) {
//     const id = rawId.replace(`!${importSuffix}`, '');
//     const type = (match[2] || 'info') as ColorSchemeLoaderType;
//     return {
//       id,
//       type,
//     };
//   }
// }

export interface ColorSchemePluginOptions {
  src: string;
  dest?: string;
}

export function colorSchemeVitePlugin(opts: ColorSchemePluginOptions): Plugin {
  // let server: ViteDevServer;

  const { src } = opts;

  const rawEntryPoint = path.resolve(src);
  // const cacheName = entry.replace(/\//g, '_') + '.scss';
  // console.log('!!!', cacheName);

  return {
    name: 'colorScheme',
    async config(config) {
      const { dest: _dest } = opts;

      let dest: string;

      if (!_dest) {
        const pkgDir = await findPackageDir();
        if (!pkgDir) throw new ColorSchemeError('missing package.json');
        dest = path.join(pkgDir, '.color-scheme');
      } else {
        dest = _dest;
      }

      let watcher: chokidar.FSWatcher | null;

      async function load() {
        if (watcher) {
          watcher.close();
          watcher = null;
        }

        const loadResult = await loadColorScheme(rawEntryPoint, dest);

        const watcherIgnoreRe = /^(node_modules|node-file:)/;

        const { dependencies } = loadResult;
        const filteredDependencies = dependencies.filter(
          (d) => !watcherIgnoreRe.test(d),
        );
        if (filteredDependencies.length) {
          watcher = chokidar.watch(filteredDependencies).on('change', load);
        }

        return loadResult;
      }

      const { cachePaths } = await load();

      const cssOptions = {
        ...config.css,
      };
      cssOptions.preprocessorOptions = {
        ...cssOptions.preprocessorOptions,
      };
      const { preprocessorOptions } = cssOptions;
      preprocessorOptions.scss = {
        ...preprocessorOptions.scss,
      };
      const scssOptions = preprocessorOptions.scss;

      const _additionalData = scssOptions.additionalData;
      const additionalData = (source: string, filename: string) => {
        if (typeof _additionalData === 'string') {
          source = _additionalData + source;
        } else if (typeof _additionalData === 'function') {
          source = _additionalData(source, filename);
        }
        return `@import "${cachePaths.scss}";\n${source}`;
      };
      scssOptions.additionalData = additionalData;
      config.css = cssOptions;
      return config;
    },
    // configureServer(_server) {
    //   server = _server;
    // },
    // load(id, ssr) {
    //   if (idMatchRe.test(id)) {
    //     return '';
    //   }
    // },
    // async transform(_code, rawId, ssr) {
    //   const parsed = parseRawId(rawId);
    //   if (!parsed) return;

    //   const { id, type } = parsed;

    //   const loaded = await loadColorScheme({
    //     src: id,
    //     type,
    //   });

    //   let code: string;
    //   if (loaded.type === 'info') {
    //     code = loaded.result;
    //   } else if (loaded.type === 'json') {
    //     code = `export default ${loaded.result};`;
    //   } else {
    //     // code = loaded.result;
    //     code = `export default ${JSON.stringify(loaded.result)};`;
    //   }

    //   if (server) {
    //     const { moduleGraph } = server;
    //     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     const thisModule = moduleGraph.getModuleById(rawId)!;
    //     moduleGraph.updateModuleInfo(
    //       thisModule,
    //       new Set([loaded.entryPoint]),
    //       new Set(),
    //       false,
    //     );

    //     //
    //     // キャッシュされたscssをimportしている箇所でhmrが動作するようにする
    //     // 以下のissueが解決すれば、scssも素直にimportの上、Module解決できるようになるので
    //     // この箇所の updateModuleInfo() は不要になる
    //     // @see https://github.com/vitejs/vite/issues/3180
    //     //
    //     const scssModule = moduleGraph.getModulesByFile(loaded.scssCachePath);
    //     if (scssModule) {
    //       scssModule.forEach((mod) => {
    //         moduleGraph.updateModuleInfo(
    //           mod,
    //           new Set([loaded.entryPoint]),
    //           new Set(),
    //           false,
    //         );
    //       });
    //     }

    //     this.addWatchFile(loaded.entryPoint);
    //   }
    //   return {
    //     code,
    //     map: '',
    //   };
    // },
  };
}

// async function emptyCacheDir() {
//   const pkgDir = await findPackageDir();
//   if (!pkgDir) throw new ColorSchemeError('missing package directory.');
//   const cacheDir = path.join(pkgDir, 'node_modules/.color-scheme');
//   await fs.emptyDir(cacheDir);
//   return cacheDir;
// }

// async function loadScheme(rawEntryPoint: string) {
//   const { entryPoint, exports: exportsResult } = await esbuildRequire(
//     rawEntryPoint,
//   );
//   const scheme = exportsResult.default as ColorScheme<TN, PN, SN, OK>;
// }
