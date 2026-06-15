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
 * `generateBundle`.
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

        // Keep tsdown's own CSS out of `cssFileName` so it doesn't collide with
        // the vanilla-extract bundle that also targets `cssFileName`. The two
        // are merged into a single `cssFileName` later (see the merge hook).
        ctx.css = {
          splitting: false,
          fileName: TSDOWN_CSS_FILE_NAME,
        };

        ctx.mergeExternals(/@vanilla-extract/);

        ctx.meta.hasVanillaExtract = !!(await findFile(
          ctx.dirs.src.value,
          /\.css\.ts$/,
        ));

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
            // Merge tsdown's own CSS (emitted to `TSDOWN_CSS_FILE_NAME`) into the
            // vanilla-extract bundle so the package ships a single `cssFileName`.
            // tsdown's CSS comes first so its `@layer` declarations / resets are
            // established before the extracted component styles. Unlike renaming,
            // mutating an asset's `source` IS honored by rolldown.
            generateBundle(_opts, bundle) {
              const tmp = bundle[TSDOWN_CSS_FILE_NAME];
              const tmpCss =
                tmp && tmp.type === 'asset' ? tmp.source.toString() : '';
              if (tmp) delete bundle[TSDOWN_CSS_FILE_NAME];
              if (!tmpCss) return;

              const veAsset = bundle[cssFileName];
              if (veAsset && veAsset.type === 'asset') {
                veAsset.source = `${tmpCss}\n${veAsset.source.toString()}`;
              } else {
                // No vanilla-extract output (e.g. `.css.ts` produced no rules) —
                // promote tsdown's CSS to the final file name.
                this.emitFile({
                  type: 'asset',
                  fileName: cssFileName,
                  source: tmpCss,
                });
              }
            },
          });
        }
      },
    },
  });
}
