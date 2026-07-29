import fs from 'node:fs/promises';
import path from 'node:path';
import type { PlugboyWorkspace } from '../workspace';
import type { Plugin, ResolvedOptimizeCSSOptions } from '../types';
import type { Processor, AcceptedPlugin as PostcssPlugin } from 'postcss';

async function getPostcss(
  options: ResolvedOptimizeCSSOptions,
): Promise<Processor> {
  const { layer, media, combineRules, cssnano } = options;
  const [postcss, _layer, _media, _combineRules, _cssnano] = await Promise.all([
    import('postcss').then((mod) => mod.default),
    layer &&
      import('../postcss/plugins/optimize-layer').then((mod) =>
        mod.OptimizeLayer(layer),
      ),
    media &&
      import('../postcss/plugins/optimize-media').then((mod) =>
        mod.OptimizeMedia(media),
      ),
    combineRules &&
      import('../postcss/plugins/combine-rules').then((mod) =>
        mod.CombineRules(combineRules),
      ),
    cssnano && import('cssnano').then((mod) => mod.default(cssnano)),
  ]);
  const plugins: PostcssPlugin[] = [];
  _layer && plugins.push(_layer);
  _media && plugins.push(_media);
  _combineRules && plugins.push(_combineRules);
  _cssnano && plugins.push(_cssnano);

  return postcss(plugins);
}

const SOURCE_MAPPING_URL_COMMENT_RE = /\/\*# sourceMappingURL=.+? \*\//g;
const allLayerDefRe = /(^|\n)@layer\s+([a-zA-Z\d\-_$. ,]+);/g;
const layerDefTrimRe = /((^|\n)@layer\s+|;)/g;

async function optimizeCSS(
  css: string,
  fileName: string,
  options: ResolvedOptimizeCSSOptions,
): Promise<string> {
  const postcss = await getPostcss(options);

  function prepare(source: string): string {
    const layerDefs = (() => {
      const matched = source.match(allLayerDefRe);
      if (!matched) return '';
      const layerNames: string[] = [];
      matched.forEach((row) => {
        const trimmed = row.replace(layerDefTrimRe, '');
        const chunks = trimmed.split(',');
        chunks.forEach((chunk) => layerNames.push(chunk.trim()));
      });
      const uniqued = Array.from(new Set(layerNames));
      const def = `@layer ${uniqued.join(', ')};\n`;
      return def;
    })();
    return layerDefs + source.replace(allLayerDefRe, '');
  }

  const result = await postcss.process(prepare(css), {
    from: fileName,
    to: fileName,
    map: { inline: false },
  });

  return result.css.replace(SOURCE_MAPPING_URL_COMMENT_RE, '');
}

/**
 * Applies {@link PlugboyWorkspace.optimizeCSSOptions} to every stylesheet the
 * build writes.
 *
 * This runs in `writeBundle`, on the files on disk, rather than on the bundle
 * assets in `generateBundle` — because not every stylesheet exists as a bundle
 * asset by then. tsdown's own CSS pipeline emits from a *post* plugin, which
 * runs after every user plugin's `generateBundle`, so CSS that tsdown produces
 * (a plain `.css` / `.scss` import, or — since the vanilla-extract plugin routes
 * its `.css.ts` through tsdown — extracted CSS) used to skip these
 * optimizations entirely, while CSS a plugin emitted itself received them. By
 * `writeBundle` every producer has finished and the whole set is on disk.
 *
 * `preserve-css-imports` re-injects external `@import`s in its own
 * `writeBundle`; it is registered after this plugin, so it always sees the
 * optimized file.
 */
export function OptimizeCSSPlugin(workspace: PlugboyWorkspace): Plugin {
  // Files already optimized, so repeated output passes are idempotent.
  const processed = new Set<string>();

  return {
    name: 'plugboy-optimize-css',
    buildStart() {
      processed.clear();
    },
    async writeBundle(options, bundle) {
      const { optimizeCSSOptions } = workspace;
      if (!optimizeCSSOptions) return;

      const { dir } = options;
      if (!dir) return;

      await Promise.all(
        Object.values(bundle).map(async (chunk) => {
          if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.css')) {
            return;
          }
          const filePath = path.join(dir, chunk.fileName);
          if (processed.has(filePath)) return;

          let css: string;
          try {
            css = await fs.readFile(filePath, 'utf8');
          } catch {
            // The asset may have been removed by another plugin.
            return;
          }
          processed.add(filePath);

          const optimized = await optimizeCSS(
            css,
            chunk.fileName,
            optimizeCSSOptions,
          );
          if (optimized !== css) {
            await fs.writeFile(filePath, optimized);
          }
        }),
      );
    },
  };
}
