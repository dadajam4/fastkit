import postcss, { AtRule, Plugin, Root } from 'postcss';

type Filter = (layerName: string, rule: AtRule) => boolean;

type FilterSpec = string | RegExp | (string | RegExp)[] | Filter;

export interface OptimizeLayerOptions {
  include?: FilterSpec;
  exclude?: FilterSpec;
}

function resolveFilter(
  spec: FilterSpec | undefined,
  defaults: boolean,
): Filter {
  if (!spec) return () => defaults;
  if (typeof spec === 'function') return spec;
  const conditions = Array.isArray(spec) ? spec : [spec];
  return (layerName) =>
    conditions.some((condition) =>
      typeof condition === 'string'
        ? layerName.includes(condition)
        : condition.test(layerName),
    );
}

interface Layer {
  name: string;
  rule: AtRule;
}

export function optimizeLayer(
  css: string | { toString(): string } | Root,
  opts: OptimizeLayerOptions = {},
): Root {
  const root = css instanceof Root ? css : postcss.parse(css);
  const layers: Layer[] = [];
  const include = resolveFilter(opts.include, true);
  const exclude = resolveFilter(opts.exclude, false);

  const getLayer = (
    layerRule: AtRule,
  ): {
    layer: Layer;
    atFirst: boolean;
  } => {
    const name = layerRule.params;
    const layer = layers.find((_layer) => _layer.name === name);
    if (layer)
      return {
        layer,
        atFirst: false,
      };

    const created: Layer = { name, rule: layerRule };
    layers.push(created);
    return {
      layer: created,
      atFirst: true,
    };
  };

  root.walkAtRules('layer', (layerRule) => {
    if (layerRule.parent?.type !== 'root') return;
    const { params, nodes } = layerRule;
    if (!nodes || !include(params, layerRule) || exclude(params, layerRule))
      return;

    const { layer, atFirst } = getLayer(layerRule);

    if (atFirst) return;

    layerRule.nodes.forEach((node) => {
      layer.rule.append(node.clone());
    });

    layerRule.remove();
  });

  return root;
}

const PLUGIN_NAME = 'optimize-layer';

export function OptimizeLayer(opts?: OptimizeLayerOptions): Plugin {
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      optimizeLayer(root, opts);
    },
  };
}

OptimizeLayer.postcss = true;

export default OptimizeLayer;
