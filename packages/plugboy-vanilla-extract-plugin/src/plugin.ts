import path from 'node:path';
import { definePlugin, findFile, type Plugin } from '@fastkit/plugboy';
import { vanillaExtractPlugin } from '@vanilla-extract/rollup-plugin';
import {
  virtualCssFileFilter,
  getSourceFromVirtualCssFile,
} from '@vanilla-extract/integration';
import { VanillaExtractPlugin, PluginOptions, PLUGIN_NAME } from './types';

declare module '@fastkit/plugboy' {
  export interface WorkspaceMeta {
    hasVanillaExtract: boolean;
  }
}

export async function createVanillaExtractPlugin(options: PluginOptions = {}) {
  return definePlugin<VanillaExtractPlugin>({
    name: PLUGIN_NAME,
    _options: options,
    hooks: {
      async setupWorkspace(ctx) {
        // Derive the CSS file name from the workspace entry, mirroring the way
        // plugboy names the JS output: the main entry (`.`) maps to the package
        // directory name (e.g. `vue-app-layout`), other entries keep their id.
        //
        // `splitting: false` produces a single combined CSS for the package, so
        // that one file has to be named after the entry plugboy declared
        // `./<entry>.css` for — which is the entry carrying `css: true`, not
        // necessarily the main one. Naming it after the main entry regardless
        // left a package whose only `css: true` entry is a secondary one (say
        // `styles`, in a package with a `.` entry that has no CSS) emitting
        // `dist/<package>.css` while plugboy declared `./styles.css`, so the
        // published export resolved to a file the build never wrote.
        //
        // With no CSS entry the name is unused; with several, `splitting` takes
        // over and names each stylesheet after its chunk.
        const entryIds = Object.keys(ctx.config.entries);
        const cssEntryIds = Object.entries(ctx.config.entries)
          .filter(([, entry]) => entry.css)
          .map(([id]) => id);
        const normalizeEntryId = (id: string) =>
          id === '.' ? ctx.dir.basename : id;
        const cssBaseName =
          cssEntryIds.length === 1
            ? normalizeEntryId(cssEntryIds[0])
            : entryIds.includes('.')
              ? ctx.dir.basename
              : (entryIds[0] ?? ctx.dir.basename);
        const cssFileName = `${cssBaseName}.css`;

        // plugboy declares a `./<entry>.css` export for every entry with
        // `css: true`, so more than one of them needs one stylesheet per entry —
        // which is what tsdown's `css.splitting` produces (one file per output
        // chunk, named after it). `splitting: false` collects the whole package
        // into `fileName`, and with several entries in play it keeps only one
        // chunk's CSS, silently dropping the rest.
        const cssEntryCount = cssEntryIds.length;

        ctx.mergeExternals(/@vanilla-extract/);

        ctx.meta.hasVanillaExtract = !!(await findFile(
          ctx.dirs.src.value,
          /\.css\.ts$/,
        ));

        // Defaults, not overrides: `...ctx.css` comes last so anything the
        // workspace/project configuration declares wins. See the README for why
        // these two keys should be left to the plugin.
        ctx.css = {
          splitting: cssEntryCount > 1,
          fileName: cssFileName,
          ...ctx.css,
        };

        if (!ctx.meta.hasVanillaExtract) return;

        // Hand vanilla-extract's extracted CSS to tsdown's own CSS pipeline.
        //
        // `@vanilla-extract/rollup-plugin` resolves its virtual stylesheets
        // (`<file>.vanilla.css?source=<serialized>`) to `{ external: true }` and,
        // in `extract` mode, emits the collected CSS itself as a rolldown asset.
        // Either way tsdown never sees the CSS, so none of the `css` options
        // apply to it — `css.target` in particular, which is why extracted CSS
        // used to ship a bare `user-select` while `.scss` in the same repo got
        // its `-webkit-` prefix.
        //
        // Resolving the virtual id to a real module instead — the approach the
        // official `@vanilla-extract/vite-plugin` takes — puts the CSS in the
        // module graph as an ordinary `.css` module. tsdown then owns it: the
        // configured `transformer` (lightningcss *or* postcss), `target`,
        // `minify` and preprocessor options all apply, and its CSS pipeline
        // collects and emits it under `css.fileName`. plugboy's `optimizeCSS`
        // runs afterwards, on the written file.
        //
        // Two details are load-bearing:
        // - The `?source=` query MUST be stripped. `@tsdown/css` skips any CSS id
        //   carrying a non-`?inline` query (`shouldSkipTransform`), in both its
        //   compile and its collect plugin — an id with the query intact is
        //   dropped from the CSS output entirely.
        // - This plugin must be registered *before* the vanilla-extract plugin so
        //   its `resolveId` wins; otherwise the module is marked external again.
        const virtualCss = new Map<string, string>();

        ctx.plugins.push({
          name: `${PLUGIN_NAME}:virtual-css`,
          buildStart() {
            virtualCss.clear();
          },
          async resolveId(source) {
            if (!virtualCssFileFilter.test(source)) return null;
            const { fileName, source: css } =
              await getSourceFromVirtualCssFile(source);
            // `fileName` is `<package-relative path>.vanilla.css`; resolving it
            // against the package gives a stable, unique module id that still
            // ends in `.css`. No file exists there — `load` below supplies the
            // content — so the path only has to be unique.
            const id = path.resolve(ctx.dir.value, fileName);
            virtualCss.set(id, css);
            return id;
          },
          load(id) {
            return virtualCss.get(id) ?? null;
          },
        });

        // `@vanilla-extract/rollup-plugin` returns a rollup `Plugin`, but
        // plugboy's `ctx.plugins` expects a tsdown (rolldown) `Plugin`. The two
        // are structurally almost identical, but hooks like `outputOptions` type
        // `this` as rollup's `PluginContext` vs rolldown's
        // `MinimalPluginContext`, which makes them unassignable (the `this` type
        // is contravariant). rolldown accepts rollup plugins at runtime, so this
        // is harmless — cast to work around the type mismatch.
        //
        // Only its `transform` hook is used here (compiling `.css.ts` to JS).
        // `extract` stays off: its asset emission is what this plugin replaces.
        ctx.plugins.push(vanillaExtractPlugin(options) as unknown as Plugin);
      },
    },
  });
}
