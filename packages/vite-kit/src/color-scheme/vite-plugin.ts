import { Plugin } from 'vite';
// import { LoadColorSchemeRunner } from './loader';
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen';
import path from 'node:path';
import { findPackageDir } from '@fastkit/node-util';
import { ViteColorSchemeError } from './logger';
import { UnPromisify } from '@fastkit/helpers';

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

export interface ColorSchemeVitePluginOptions {
  src: string;
  dest?: string;
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: (err: unknown) => any;
}

let runner: LoadColorSchemeRunner | undefined;
let cachePaths: UnPromisify<
  ReturnType<LoadColorSchemeRunner['run']>
>['exports']['cachePaths'];

export function colorSchemeVitePlugin(
  opts: ColorSchemeVitePluginOptions,
): Plugin {
  // let server: ViteDevServer;

  const { src, dest: _dest, onBooted, onBootError } = opts;

  const rawEntryPoint = path.resolve(src);

  return {
    name: 'vite:color-scheme',
    async config(config, { command }) {
      try {
        let dest: string;

        if (!_dest) {
          const pkgDir = await findPackageDir();
          if (!pkgDir) throw new ViteColorSchemeError('missing package.json');
          dest = path.join(pkgDir, '.color-scheme');
        } else {
          dest = _dest;
        }

        if (!runner) {
          runner = new LoadColorSchemeRunner({
            entry: rawEntryPoint,
            dest,
            watch: command === 'serve',
          });
        }

        if (!cachePaths) {
          cachePaths = (await runner.run()).exports.cachePaths;
        }

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
          return `@use "${cachePaths.scss}" as *;\n${source}`;
        };
        scssOptions.additionalData = additionalData;
        config.css = cssOptions;

        onBooted && (await onBooted());

        return config;
      } catch (err) {
        onBootError && onBootError(err);
        throw err;
      }
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
