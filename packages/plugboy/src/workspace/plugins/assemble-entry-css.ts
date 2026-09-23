import fs from 'node:fs/promises';
import path from 'node:path';
import { definePlugin } from '../../utils';
import type { PlugboyWorkspace } from '../workspace';
import {
  assembledStylesheetName,
  declaredStylesheets,
  toCssFileName,
} from '../stylesheets';
import {
  captureChunkGraph,
  orderChunks,
  orderPackageChunks,
  type ChunkGraph,
} from '../chunk-order';

/**
 * Plugin that builds every stylesheet plugboy declares — `./<entry>.css` for each
 * `css: true` entry — from the per-chunk stylesheets the build emits, in the
 * order they load.
 *
 * plugboy runs tsdown with `css.splitting` on (see `resolveCssOptions`), which
 * emits one stylesheet per output *chunk*. Neither that nor tsdown's single-file
 * merge matches what plugboy publishes:
 *
 * - tsdown's merge concatenates the chunks in bundle order — entries first,
 *   shared chunks after. A package that composes from a shared base style then
 *   ships the base *after* the rules built on it, and the base wins.
 * - Per-chunk stylesheets are named after chunks. CSS reached from several
 *   entries lands in a shared chunk under a hashed name no export points at, and
 *   an entry whose CSS comes only from there gets no stylesheet at all.
 *
 * So each declared stylesheet is rebuilt here, with the chunks ordered as Vite
 * orders them for `build.cssCodeSplit: false` (`orderChunks`): static imports
 * before their importer, dynamically imported chunks after. Nothing is left for a
 * dynamic `import()` to load, since without `css.inject` the JavaScript imports no
 * stylesheet at all.
 *
 * - **One CSS entry**: the package publishes one stylesheet, so it gets the CSS of
 *   every chunk — the same content tsdown's merge would have produced, in
 *   dependency order. It is written under `css.fileName` when one is set.
 * - **Several**: each gets its own CSS and that of every chunk it reaches. CSS
 *   shared between entries is duplicated into each, which is what makes a single
 *   `./<entry>.css` import complete.
 *
 * The per-chunk stylesheets that were folded in are deleted, since nothing
 * exports them.
 *
 * The chunk graph has to be captured in `generateBundle`, because it is gone by
 * the time the stylesheets exist: a chunk holding nothing but CSS is dropped once
 * tsdown's CSS pipeline (a *post* plugin, so it runs after this hook) has emitted
 * its stylesheet, and its importers' `imports` are emptied along with it. By
 * `writeBundle` the shared chunk is neither in the bundle nor on disk — only its
 * orphaned stylesheet is.
 *
 * Nothing is assembled when tsdown merged the stylesheet itself (`splitting` off,
 * declared explicitly), or with `css.inject`, where the JavaScript imports the
 * per-chunk stylesheets by name.
 */
export function createAssembleEntryCssPlugin(workspace: PlugboyWorkspace) {
  let graph: ChunkGraph = new Map();

  return definePlugin({
    name: 'plugboy-assemble-entry-css',
    buildStart() {
      graph = new Map();
    },
    generateBundle(_options, bundle) {
      graph = captureChunkGraph(bundle);
    },
    async writeBundle(options, bundle) {
      const { dir } = options;
      if (!dir) return;

      const { cssOptions } = workspace;
      if (!cssOptions?.splitting || cssOptions.inject) return;

      const targets = declaredStylesheets(workspace);
      if (!targets.size) return;

      const emitted = new Set(
        Object.values(bundle)
          .filter(
            (chunk) =>
              chunk.type === 'asset' && chunk.fileName.endsWith('.css'),
          )
          .map((chunk) => chunk.fileName),
      );
      if (!emitted.size) return;

      /** The stylesheets of `chunks`, in the same order, each listed once. */
      const stylesheetsOf = (chunks: string[]): string[] => {
        const ordered: string[] = [];
        for (const fileName of chunks) {
          const css = toCssFileName(fileName);
          if (css === fileName || !emitted.has(css)) continue;
          if (!ordered.includes(css)) ordered.push(css);
        }
        return ordered;
      };

      /** Output file name -> the stylesheets it is built from. */
      const plan = new Map<string, string[]>();

      const packageStylesheet = assembledStylesheetName(workspace);
      if (packageStylesheet) {
        plan.set(
          packageStylesheet,
          stylesheetsOf(
            orderPackageChunks(graph, Object.keys(workspace.entry)),
          ),
        );
      } else {
        for (const [fileName, node] of graph) {
          if (!node.isEntry) continue;
          const target = `${node.name}.css`;
          if (!targets.has(target)) continue;
          plan.set(target, stylesheetsOf(orderChunks(graph, [fileName])));
        }
      }

      const outputs = new Set(plan.keys());
      const folded = new Set<string>();

      // Read everything before writing anything: an entry that imports another
      // entry lists that entry's stylesheet as a source, and must not read it
      // after it has been overwritten with its assembled form.
      const assembled = await Promise.all(
        [...plan].map(async ([target, sources]) => {
          // Nothing attributable to this stylesheet — one a plugin emitted
          // itself, or none at all. Either way there is nothing to rebuild.
          if (!sources.length) return undefined;
          sources.forEach((source) => folded.add(source));
          if (sources.length === 1 && sources[0] === target) return undefined;

          const parts = await Promise.all(
            sources.map((source) =>
              fs.readFile(path.join(dir, source), 'utf8').catch(() => ''),
            ),
          );
          const css = parts.filter(Boolean).join('\n');
          return css ? { target, css } : undefined;
        }),
      );

      await Promise.all(
        assembled.map(
          (output) =>
            output && fs.writeFile(path.join(dir, output.target), output.css),
        ),
      );

      // Drop the per-chunk stylesheets that were folded into a declared one: they
      // are named after a chunk, so no export can point at them.
      await Promise.all(
        [...folded]
          .filter((css) => !outputs.has(css))
          .map((css) => fs.rm(path.join(dir, css), { force: true })),
      );
    },
  });
}
