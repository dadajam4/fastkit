import {
  captureChunkGraph,
  definePlugin,
  orderPackageChunks,
  type TryGetWorkspace,
} from '@fastkit/plugboy';
import sass from 'rollup-plugin-sass';
import {
  PLUGIN_NAME,
  PluginOptions,
  SassPlugin,
  SassStyleEntry,
} from './types';
import { modulesPaths } from './utils';

/** The parts of a bundle output the ordering reads. */
interface BundleOutput {
  type: string;
  fileName: string;
  name?: string;
  isEntry?: boolean;
  imports?: string[];
  dynamicImports?: string[];
  modules?: Record<string, unknown>;
}

/**
 * Concatenate the collected stylesheets in module execution order.
 *
 * rollup-plugin-sass appends each stylesheet to a flat array from its
 * `transform` hook, then joins that array as-is. rolldown runs `transform`
 * concurrently, so the array ends up in whatever order the transforms happened
 * to finish and the emitted CSS differs between builds of identical sources —
 * which matters, because that order is the cascade order.
 *
 * The key is the order the stylesheets load in: chunks in dependency order
 * (`orderPackageChunks`, the order plugboy assembles every other stylesheet in),
 * and modules in their order within each chunk. The bundle's own chunk order is
 * stable but not usable, since it puts a shared chunk after the entries that
 * depend on it. Entries the module graph does not account for keep the order
 * they were collected in, after the ones that could be placed.
 */
function concatStylesInModuleOrder(
  entries: SassStyleEntry[],
  bundle: Record<string, BundleOutput>,
  entryIds: readonly string[] | undefined,
): string {
  const position = new Map<string, number>();

  for (const fileName of orderPackageChunks(
    captureChunkGraph(bundle),
    entryIds,
  )) {
    const chunk = bundle[fileName];
    if (chunk?.type !== 'chunk' || !chunk.modules) continue;
    for (const id of Object.keys(chunk.modules)) {
      if (!position.has(id)) position.set(id, position.size);
    }
  }

  return entries
    .map((entry, collectedAt) => ({ entry, collectedAt }))
    .sort((a, b) => {
      const pa =
        a.entry.id === undefined ? undefined : position.get(a.entry.id);
      const pb =
        b.entry.id === undefined ? undefined : position.get(b.entry.id);
      if (pa === undefined && pb === undefined)
        return a.collectedAt - b.collectedAt;
      if (pa === undefined) return 1;
      if (pb === undefined) return -1;
      return pa - pb;
    })
    .map(({ entry }) => entry.content || '')
    .join('');
}

export function createSassPlugin(options: PluginOptions = {}) {
  let _styleEntries: SassStyleEntry[] = [];

  const { sass: sassOptions, ...restOptions } = options;

  const {
    name: _name,
    generateBundle,
    ...sassPluginSettings
  } = sass({
    api: 'modern',
    ...restOptions,
    options: {
      ...sassOptions,
      loadPaths: Array.from(
        new Set([...(sassOptions?.loadPaths || modulesPaths())]),
      ),
    },
    // The joined string this also receives is built in transform-completion
    // order, so take the entries and join them ourselves.
    output(_styles, entries) {
      _styleEntries = entries;
    },
  });

  let _getWorkspace: TryGetWorkspace;

  return definePlugin<SassPlugin>({
    name: PLUGIN_NAME,
    _options: options,
    ...(sassPluginSettings as any),
    hooks: {
      setupWorkspace(_, getWorkspace) {
        _getWorkspace = getWorkspace;
      },
    },
    async generateBundle(outputOptions, bundle, isWrite) {
      if (typeof generateBundle === 'function') {
        await generateBundle.call(
          this as any,
          outputOptions as any,
          bundle as any,
          isWrite,
        );
      }

      const workspace = _getWorkspace();
      const styles = concatStylesInModuleOrder(
        _styleEntries,
        bundle as unknown as Record<string, BundleOutput>,
        workspace && Object.keys(workspace.entry),
      );
      if (!styles) return;

      let cssFile = outputOptions.file;

      if (!cssFile) {
        const cssExport = workspace?.exports.find((e) => e.id.endsWith('.css'));
        if (cssExport) {
          const tmp = cssExport.id.split('/');
          cssFile = tmp[tmp.length - 1];
        } else {
          const fileNames = Object.keys(bundle);
          const jsFile = fileNames.find((f) => /\.m?js$/.test(f));

          if (!jsFile) {
            return;
          }
          cssFile = jsFile.replace(/\.m?js$/, '.css');
        }
      }
      this.emitFile({
        type: 'asset',
        name: cssFile,
        fileName: cssFile,
        source: styles,
      });
    },
  });
}
