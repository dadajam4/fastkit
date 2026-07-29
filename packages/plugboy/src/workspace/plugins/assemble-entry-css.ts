import fs from 'node:fs/promises';
import path from 'node:path';
import { definePlugin } from '../../utils';
import type { PlugboyWorkspace } from '../workspace';
import { declaredStylesheets, toCssFileName } from '../stylesheets';

/**
 * Plugin that guarantees the stylesheet of every `css: true` entry exists, and is
 * self-contained.
 *
 * plugboy declares a `./<entry>.css` export for each such entry. With more than
 * one of them the build has to emit one stylesheet per entry, which is what
 * tsdown's `css.splitting` does — but it splits by *output chunk*, not by entry:
 *
 * - CSS reached from several entries is moved into a shared chunk and emitted
 *   under that chunk's hashed name, which no export points at. Importing
 *   `./<entry>.css` then yields an incomplete stylesheet.
 * - An entry whose CSS comes *only* from such a shared chunk gets no stylesheet of
 *   its own at all, so its declared export resolves to a missing file.
 *
 * This rebuilds each entry's stylesheet from its own CSS plus the CSS of every
 * chunk it imports, dependencies first — the order the stylesheets would have been
 * loaded in. CSS shared between entries is therefore duplicated into each, which
 * is what makes a single `./<entry>.css` import complete. The per-chunk
 * stylesheets that were folded in are deleted, since nothing exports them.
 *
 * The chunk graph has to be captured in `generateBundle`, because it is gone by
 * the time the stylesheets exist: a chunk holding nothing but CSS is dropped once
 * tsdown's CSS pipeline (a *post* plugin, so it runs after this hook) has emitted
 * its stylesheet, and its importers' `imports` are emptied along with it. By
 * `writeBundle` the shared chunk is neither in the bundle nor on disk — only its
 * orphaned stylesheet is.
 *
 * A build that emits one stylesheet for the whole package (`css.splitting: false`,
 * the default for a single CSS entry) is left untouched: the entry chunk's
 * stylesheet is already the one and only output.
 */

interface ChunkNode {
  name: string;
  isEntry: boolean;
  imports: string[];
}

export function createAssembleEntryCssPlugin(workspace: PlugboyWorkspace) {
  /** Chunk file name -> its identity and static imports, as of `generateBundle`. */
  const graph = new Map<string, ChunkNode>();

  return definePlugin({
    name: 'plugboy-assemble-entry-css',
    buildStart() {
      graph.clear();
    },
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue;
        graph.set(chunk.fileName, {
          name: chunk.name,
          isEntry: chunk.isEntry,
          // Static imports only: a dynamically imported chunk brings its own
          // stylesheet along at runtime.
          imports: [...chunk.imports],
        });
      }
    },
    async writeBundle(options, bundle) {
      const { dir } = options;
      if (!dir) return;

      // `css.inject` makes the JS import its stylesheet by name, so the per-chunk
      // files are referenced and must not be removed.
      if (workspace.cssOptions?.inject) return;

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

      /** The stylesheet a chunk owns, if the build emitted one. */
      const cssOf = (fileName: string): string | undefined => {
        const css = toCssFileName(fileName);
        return css !== fileName && emitted.has(css) ? css : undefined;
      };

      /** Stylesheets an entry needs, dependencies first, each listed once. */
      const collect = (entryFileName: string): string[] => {
        const visited = new Set<string>();
        const ordered: string[] = [];
        const walk = (fileName: string) => {
          if (visited.has(fileName)) return;
          visited.add(fileName);
          const node = graph.get(fileName);
          if (!node) return;
          for (const imported of node.imports) walk(imported);
          const css = cssOf(fileName);
          if (css && !ordered.includes(css)) ordered.push(css);
        };
        walk(entryFileName);
        return ordered;
      };

      const folded = new Set<string>();

      await Promise.all(
        [...graph].map(async ([fileName, node]) => {
          if (!node.isEntry) return;
          const target = `${node.name}.css`;
          if (!targets.has(target)) return;

          const sources = collect(fileName);
          // Nothing attributable to this entry — a single combined stylesheet, or
          // one a plugin emitted itself. Either way it is already correct.
          if (!sources.length) return;
          sources.forEach((source) => folded.add(source));
          if (sources.length === 1 && sources[0] === target) return;

          const parts = await Promise.all(
            sources.map((source) =>
              fs.readFile(path.join(dir, source), 'utf8').catch(() => ''),
            ),
          );
          const css = parts.filter(Boolean).join('\n');
          if (!css) return;
          await fs.writeFile(path.join(dir, target), css);
          folded.add(target);
        }),
      );

      // Drop the per-chunk stylesheets that were folded into an entry's: they are
      // named after a chunk, so no export can point at them.
      await Promise.all(
        [...folded]
          .filter((css) => !targets.has(css))
          .map((css) => fs.rm(path.join(dir, css), { force: true })),
      );
    },
  });
}
