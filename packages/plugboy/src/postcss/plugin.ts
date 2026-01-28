import type { PlugboyWorkspace } from '../workspace';
import type { Plugin, ResolvedOptimizeCSSOptions } from '../types';
import type { Processor, AcceptedPlugin as PostcssPlugin } from 'postcss';
import type { OutputAsset } from 'rolldown';

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
  asset: OutputAsset,
  options: ResolvedOptimizeCSSOptions,
) {
  const postcss = await getPostcss(options);
  // let postcss = this._postcssCache;
  // if (!postcss) {
  //   postcss = await getPostcss(options);
  //   this._postcssCache = postcss;
  // }

  function prepare(css: string): string {
    const layerDefs = (() => {
      const matched = css.match(allLayerDefRe);
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
    return layerDefs + css.replace(allLayerDefRe, '');
  }

  const css = prepare(asset.source.toString());

  const result = await postcss.process(css, {
    from: asset.fileName,
    to: asset.fileName,
    map: { inline: false },
  });

  asset.source = result.css.replace(SOURCE_MAPPING_URL_COMMENT_RE, '');
}

export function OptimizeCSSPlugin(workspace: PlugboyWorkspace): Plugin {
  return {
    name: 'plugboy-optimize-css',
    async generateBundle(_options, bundle) {
      const { optimizeCSSOptions } = workspace;
      if (!optimizeCSSOptions) return;

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'asset' || !chunk.fileName.endsWith('.css')) {
          continue;
        }
        await optimizeCSS(chunk, optimizeCSSOptions);
      }
    },
  };
}
