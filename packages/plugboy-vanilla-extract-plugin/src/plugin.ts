import fs from 'node:fs/promises';
import path from 'node:path';
import { definePlugin, findFile, type Plugin } from '@fastkit/plugboy';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import { VanillaExtractPlugin, PluginOptions, PLUGIN_NAME } from './types';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVanillaExtract: boolean;
  }
}

/**
 * Temporary file name for the CSS that tsdown's own CSS pipeline emits.
 *
 * A package can have two independent sources of CSS:
 * - tsdown's built-in CSS handling, for plain `.css` / `.scss` imports.
 * - `@vanilla-extract/rollup-plugin`, for `.css.ts` files (extracted into a
 *   single bundle named after the package).
 *
 * If both are pointed at the same final file name they collide
 * (`FILE_NAME_CONFLICT` — one silently overwrites the other, dropping all of
 * the vanilla-extract component CSS). To avoid that we route tsdown's CSS to
 * this temporary name and merge it into the vanilla-extract bundle in
 * `writeBundle`.
 */
const TSDOWN_CSS_FILE_NAME = '__ve-tsdown__.css';

export async function createVanillaExtractPlugin(options: PluginOptions = {}) {
  return definePlugin<VanillaExtractPlugin>({
    name: PLUGIN_NAME,
    _options: options,
    hooks: {
      async setupWorkspace(ctx, getWorkspace) {
        // Derive the final CSS file name from the workspace entry, mirroring the
        // way plugboy names the JS output: the main entry (`.`) maps to the
        // package directory name (e.g. `vue-app-layout`), other entries keep
        // their id. Since `splitting: false` produces a single combined CSS for
        // the package, we base it on the main entry (falling back to the first).
        // Result: `dist/vue-app-layout.css` instead of `dist/__ve-tmp__.css`.
        const entryIds = Object.keys(ctx.config.entries);
        const cssBaseName = entryIds.includes('.')
          ? ctx.dir.basename
          : (entryIds[0] ?? ctx.dir.basename);
        const cssFileName = `${cssBaseName}.css`;

        // Routing for tsdown's plain-CSS blob (see `writeBundle`). plugboy's CSS
        // pipeline emits ALL plain (non-`.css.ts`) CSS — e.g. an `@font-face`
        // sheet `import`ed by an entry — into a single combined file
        // (`TSDOWN_CSS_FILE_NAME`); it cannot be split per entry (tsdown's own CSS
        // `splitting` drops the styles entirely when vanilla-extract is present).
        // The per-entry split in `generateBundle` fills these so the blob is
        // merged into the right entry CSS files instead of an orphan
        // `cssFileName`. Defaults (no split) keep the original single-file
        // behavior. `plainCssTargets`: entry CSS files (`a.css`) that import plain
        // CSS. `plainCssFallback`: where the blob goes when the split fired but no
        // entry with a CSS file owns the plain CSS (avoids re-creating an orphan).
        const plainCssTargets = new Set<string>();
        let plainCssFallback = cssFileName;

        ctx.mergeExternals(/@vanilla-extract/);

        ctx.meta.hasVanillaExtract = !!(await findFile(
          ctx.dirs.src.value,
          /\.css\.ts$/,
        ));

        // When vanilla-extract is in play, route tsdown's own CSS to a temporary
        // name so it doesn't collide with the vanilla-extract bundle that also
        // targets `cssFileName`; the two are merged into a single `cssFileName`
        // by the `writeBundle` hook below. Without vanilla-extract there is no
        // second producer, so tsdown emits `cssFileName` directly.
        ctx.css = {
          splitting: false,
          fileName: ctx.meta.hasVanillaExtract
            ? TSDOWN_CSS_FILE_NAME
            : cssFileName,
        };

        if (ctx.meta.hasVanillaExtract) {
          const originalPlugin = vanillaExtractPlugin({
            ...options,
            extract: {
              name: cssFileName,
              sourcemap: false,
            },
          });

          // `@vanilla-extract/rollup-plugin` returns a rollup `Plugin`, but
          // plugboy's `ctx.plugins` expects a tsdown (rolldown) `Plugin`. The two
          // are structurally almost identical, but hooks like `outputOptions`
          // type `this` as rollup's `PluginContext` vs rolldown's
          // `MinimalPluginContext`, which makes them unassignable (the `this`
          // type is contravariant). rolldown accepts rollup plugins at runtime,
          // so this is harmless — cast to work around the type mismatch.
          ctx.plugins.push(originalPlugin as unknown as Plugin);

          // `@vanilla-extract/rollup-plugin` emits the extracted CSS via
          // `emitFile({ type: 'asset', name: cssFileName })`. Because it uses
          // `name` (a hint) rather than `fileName`, rolldown runs it through the
          // default `assetFileNames` pattern (`assets/[name]-[hash][extname]`),
          // producing e.g. `dist/assets/vue-app-layout-dry0z-1l.css`.
          //
          // We can't *rename* an asset in `generateBundle` because rolldown
          // ignores mutations to a bundle entry's `fileName`. Instead, override
          // `assetFileNames` via the `outputOptions` hook so this single CSS
          // asset keeps its derived name verbatim (no hash, no `assets/` dir)
          // while every other asset keeps its original naming.
          ctx.plugins.push({
            name: `${PLUGIN_NAME}:rename-css`,
            outputOptions(opts) {
              const original = opts.assetFileNames;
              opts.assetFileNames = (assetInfo) => {
                if (assetInfo.names.includes(cssFileName)) {
                  return cssFileName;
                }
                if (typeof original === 'function') return original(assetInfo);
                return original ?? 'assets/[name]-[hash][extname]';
              };
              return opts;
            },
            // Split vanilla-extract's single bundle into one CSS file per entry.
            //
            // `extract: { name }` mode collects the CSS of EVERY `.css.ts` in the
            // graph into one asset (`cssFileName`), which loses plugboy's per-entry
            // CSS contract: every entry with `css: true` declares a `./<entry>.css`
            // export, but only `cssFileName` is ever produced. We rebuild the
            // per-entry files from data vanilla-extract already exposes:
            // `moduleInfo.meta.css` (its public hand-off for extracted CSS, the
            // same field its own bundler reads).
            //
            // CSS is attributed to an entry by walking the INPUT module graph from
            // that entry's `facadeModuleId` via `getModuleInfo().importedIds`, NOT
            // by reading the output chunk's `imports`. `chunk.imports` lists output
            // chunk file names plus external ids, and whether vanilla-extract's
            // external virtual CSS ids appear there is rolldown-version-dependent
            // (some versions only list real output chunks, so the lookup finds
            // nothing and the split silently no-ops). The input graph is stable: it
            // always yields the `.css.ts` modules an entry reaches, regardless of
            // how rolldown chunks the output. A `.css.ts` shared by several entries
            // is included in each entry's file (self-contained per-entry CSS).
            //
            // We never parse vanilla-extract's asset names or re-add the import
            // statements it strips, so the only coupling is `meta.css`.
            //
            // Runs before `plugboy-optimize-css` (appended later in
            // `workspace.plugins`), so each emitted per-entry file still goes
            // through the postcss optimizations.
            //
            // Only splits when more than one entry actually has CSS. With a single
            // CSS entry (the common case) vanilla-extract's bundle is already the
            // correct, fully-ordered output, so it is left untouched and existing
            // single-entry packages are byte-for-byte unaffected.
            generateBundle(_options, bundle) {
              // Walk the input module graph from `root`, collecting (deduped, in
              // import order) the CSS of every `.css.ts` reached (`meta.css`), and
              // flagging whether any plain (non-`.css.ts`) CSS file is imported.
              const collectEntryCss = (
                root: string,
              ): { css: string[]; hasPlain: boolean } => {
                const visited = new Set<string>();
                const seenCss = new Set<string>();
                const out: string[] = [];
                let hasPlain = false;
                const walk = (id: string) => {
                  if (visited.has(id)) return;
                  visited.add(id);
                  const info = this.getModuleInfo(id);
                  if (!info) return;
                  for (const dep of info.importedIds ?? []) {
                    const css = this.getModuleInfo(dep)?.meta?.css;
                    if (typeof css === 'string') {
                      // vanilla-extract virtual CSS (`*.vanilla.css`).
                      if (!seenCss.has(dep)) {
                        seenCss.add(dep);
                        out.push(css);
                      }
                    } else if (/\.css(\?|$)/i.test(dep)) {
                      // Plain CSS import (no `meta.css`) — its content lives in
                      // tsdown's combined blob, merged per entry in `writeBundle`.
                      hasPlain = true;
                    }
                    walk(dep);
                  }
                };
                walk(root);
                return { css: out, hasPlain };
              };

              const entryCss: {
                name: string;
                source: string;
                hasPlain: boolean;
              }[] = [];

              for (const chunk of Object.values(bundle)) {
                if (
                  chunk.type !== 'chunk' ||
                  !chunk.isEntry ||
                  !chunk.fileName.endsWith('.mjs') ||
                  !chunk.facadeModuleId
                ) {
                  continue;
                }
                const { css, hasPlain } = collectEntryCss(chunk.facadeModuleId);
                if (css.length) {
                  entryCss.push({
                    name: chunk.name,
                    source: css.join('\n'),
                    hasPlain,
                  });
                }
              }

              // 0 or 1 CSS entry → vanilla-extract's bundle is already correct,
              // and the single-file `writeBundle` fallback applies unchanged.
              if (entryCss.length <= 1) return;

              // Replace vanilla-extract's combined bundle with per-entry files.
              // The entry whose file name matches `cssFileName` overwrites the
              // existing asset in place — re-`emitFile`ing the same name would
              // trip rolldown's FILE_NAME_CONFLICT, since deleting the bundle
              // entry does not release the reserved file name. Other entries are
              // emitted as new assets.
              const reused = new Set<string>();
              for (const { name, source } of entryCss) {
                const fileName = `${name}.css`;
                const existing = bundle[fileName];
                if (existing && existing.type === 'asset') {
                  existing.source = source;
                  reused.add(fileName);
                } else {
                  this.emitFile({ type: 'asset', fileName, source });
                }
              }

              // Drop vanilla-extract's combined bundle if no entry reused it.
              const combined = bundle[cssFileName];
              if (
                combined &&
                combined.type === 'asset' &&
                !reused.has(cssFileName)
              ) {
                delete bundle[cssFileName];
              }

              // Tell `writeBundle` where to merge tsdown's plain-CSS blob: into
              // each entry CSS file whose entry imports plain CSS. Falling back to
              // the first entry's file keeps the blob attached to a real, exported
              // CSS file instead of resurrecting the now-deleted `cssFileName`.
              plainCssTargets.clear();
              plainCssFallback = `${entryCss[0].name}.css`;
              for (const { name, hasPlain } of entryCss) {
                if (hasPlain) plainCssTargets.add(`${name}.css`);
              }
            },
            // Merge tsdown's own plain-CSS blob (emitted to
            // `TSDOWN_CSS_FILE_NAME`) into the vanilla-extract CSS file(s).
            //
            // This has to happen in `writeBundle`, not `generateBundle`: tsdown
            // emits its CSS in a separate output pass, so `TSDOWN_CSS_FILE_NAME`
            // is absent from the bundle our `generateBundle` sees but present by
            // `writeBundle`. By then the vanilla-extract files are already on disk,
            // so we merge on disk rather than mutating bundle sources. tsdown's
            // CSS goes first so its `@layer` declarations / resets / `@font-face`
            // are established before the extracted component styles.
            //
            // Targets:
            // - Per-entry split fired → the entry CSS files whose entries import
            //   plain CSS (`plainCssTargets`), falling back to the first entry's
            //   file. Never `cssFileName`, which the split deleted (no orphan).
            // - No split (single CSS entry) → `cssFileName`, the one combined file.
            // The combined blob cannot be partitioned per entry, so when several
            // entries import distinct plain CSS each target receives the whole
            // blob; in practice plain CSS (fonts/resets) is imported by one entry.
            async writeBundle(outputOptions, bundle) {
              // Only the output pass that emitted tsdown's CSS performs the merge
              // (it is the one whose `bundle` contains `TSDOWN_CSS_FILE_NAME`).
              // This also prevents a second output from re-injecting the imports.
              const tmp = bundle[TSDOWN_CSS_FILE_NAME];
              if (!tmp) return;

              const tmpCss = tmp.type === 'asset' ? tmp.source.toString() : '';
              const dir = outputOptions.dir ?? '.';
              const tmpPath = path.join(dir, TSDOWN_CSS_FILE_NAME);

              if (tmpCss) {
                const targets = plainCssTargets.size
                  ? [...plainCssTargets]
                  : [plainCssFallback];

                await Promise.all(
                  targets.map(async (target) => {
                    const targetPath = path.join(dir, target);
                    let targetCss = '';
                    try {
                      targetCss = await fs.readFile(targetPath, 'utf8');
                    } catch {
                      // No vanilla-extract file for this target (e.g. `.css.ts`
                      // produced no rules) — tsdown's CSS becomes the whole file.
                    }
                    await fs.writeFile(
                      targetPath,
                      targetCss ? `${tmpCss}\n${targetCss}` : tmpCss,
                    );
                  }),
                );
              }

              await fs.rm(tmpPath, { force: true });
            },
          });
        }
      },
    },
  });
}
