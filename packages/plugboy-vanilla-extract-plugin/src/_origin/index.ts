import type { Plugin, OutputChunk } from 'rolldown';
import {
  cssFileFilter,
  processVanillaFile,
  compile,
  type IdentifierOption,
  getSourceFromVirtualCssFile,
  virtualCssFileFilter,
  transform,
  type CompileOptions,
} from '@vanilla-extract/integration';
import { posix } from 'path';
import {
  generateCssBundle,
  stripSideEffectImportsMatching,
  tryGetPackageName,
} from './lib';

const { relative, normalize, dirname } = posix;

export interface Options {
  /**
   * Different formatting of identifiers (e.g. class names, keyframes, CSS Vars, etc) can be configured by selecting from the following options:
   * - "short": 7+ character hash. e.g. hnw5tz3
   * - "debug": human readable prefixes representing the owning filename and a potential rule level debug name. e.g. myfile_mystyle_hnw5tz3
   * - custom function: takes an object parameter with `hash`, `filePath`, `debugId`, and `packageName`, and returns a customized identifier.
   * @default "short"
   * @example ({ hash }) => `prefix_${hash}`
   */
  identifiers?: IdentifierOption;
  /**
   * Current working directory
   * @default process.cwd()
   */
  cwd?: string;
  /**
   * Options forwarded to esbuild
   * @see https://esbuild.github.io/
   */
  esbuildOptions?: CompileOptions['esbuildOptions'];
  /**
   * Extract .css bundle to a specified filename
   * @default false
   */
  extract?:
    | {
        /**
         * Name of emitted .css file.
         * @default "bundle.css"
         */
        name?: string | ((chunk: OutputChunk) => string);
        /**
         * Generate a .css.map file?
         * @default false
         */
        sourcemap?: boolean;
      }
    | boolean;

  /**
   * Inject filescopes into Vanilla Extract modules instead of generating CSS.
   * Useful for utility or component libraries that prefer their consumers to
   * process Vanilla Extract files instead of bundling CSS.
   *
   * Only works with `preserveModules: true`.
   *
   * @default false
   */
  unstable_injectFilescopes?: boolean;
}

export function vanillaExtractPlugin({
  identifiers,
  cwd = process.cwd(),
  esbuildOptions,
  extract = false,
  unstable_injectFilescopes = false,
}: Options = {}): Plugin {
  if (extract === true) {
    extract = {};
  }
  const isProduction = process.env.NODE_ENV === 'production';

  let extractedCssIds = new Set<string>(); // only for `extract`

  return {
    name: 'vanilla-extract',

    buildStart() {
      extractedCssIds = new Set(); // refresh every build
    },

    // Transform .css.js to .js
    async transform(code, id) {
      if (!cssFileFilter.test(id)) {
        return null;
      }

      const identOption = identifiers ?? (isProduction ? 'short' : 'debug');
      const [filePath] = id.split('?');

      if (unstable_injectFilescopes) {
        const packageName = await tryGetPackageName(cwd);
        const transformedCode = await transform({
          source: code,
          filePath: id,
          rootPath: cwd,
          packageName: packageName ?? '',
          identOption,
        });

        return {
          code: transformedCode,
          map: { mappings: '' },
        };
      }

      const { source, watchFiles } = await compile({
        filePath,
        cwd,
        esbuildOptions,
        identOption,
      });

      for (const file of watchFiles) {
        this.addWatchFile(file);
      }

      const output = await processVanillaFile({
        source,
        filePath,
        identOption,
      });
      return {
        code: output,
        map: { mappings: '' },
      };
    },

    // Resolve .css to external module
    async resolveId(id) {
      if (!virtualCssFileFilter.test(id)) {
        return null;
      }
      const { fileName, source } = await getSourceFromVirtualCssFile(id);
      return {
        id: fileName,
        external: true,
        meta: {
          css: source,
        },
      };
    },
    // Emit .css assets and replace .css import paths with relative paths to emitted css files
    renderChunk(code, chunkInfo) {
      const chunkPath = dirname(chunkInfo.fileName);
      const output = chunkInfo.imports.reduce((codeResult, importPath) => {
        const moduleInfo = this.getModuleInfo(importPath);
        if (!moduleInfo?.meta.css || extract) {
          return codeResult;
        }

        const assetId = this.emitFile({
          type: 'asset',
          name: moduleInfo.id,
          source: moduleInfo.meta.css,
        });
        const assetPath = this.getFileName(assetId);
        const relativeAssetPath = `./${normalize(
          relative(chunkPath, assetPath),
        )}`;
        return codeResult.replace(importPath, relativeAssetPath);
      }, code);

      return {
        code: output,
        map: null,
      };
    },

    // Remove side effect imports (if extracting)
    async generateBundle(_options, bundle) {
      if (!extract) {
        return;
      }

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.isEntry) continue;

        const jsFileName = chunk.fileName; // index.js / index.mjs
        // Skip DTS files
        if (/\.d\.(ts|mts|cts)$/.test(jsFileName)) continue;

        const extractName = extract.name || '[name].css';
        const name = jsFileName.replace(/\.(js|mjs)$/, '');
        const cssFileName =
          typeof extractName === 'function'
            ? extractName(chunk)
            : extractName.replace('[name]', name);

        const { bundle: cssBundle, extractedCssIds: extractedIds } =
          generateCssBundle(this);
        extractedCssIds = extractedIds;
        // const name = extract.name || 'bundle.css';
        this.emitFile({
          type: 'asset',
          fileName: cssFileName,
          source: cssBundle.toString(),
        });

        if (extract.sourcemap) {
          const sourcemapName = `${cssFileName}.map`;
          this.emitFile({
            type: 'asset',
            name: sourcemapName,
            originalFileName: sourcemapName,
            source: cssBundle
              .generateMap({ file: name, includeContent: true })
              .toString(),
          });
        }
      }

      await Promise.all(
        Object.entries(bundle).map(async ([id, chunk]) => {
          if (
            chunk.type === 'chunk' &&
            (id.endsWith('.js') || id.endsWith('.mjs')) &&
            chunk.imports.some((specifier) => extractedCssIds.has(specifier))
          ) {
            chunk.code = await stripSideEffectImportsMatching(chunk.code, [
              ...extractedCssIds,
            ]);
          }
        }),
      );
    },
  };
}
