import postcss, {
  AtRule,
  Plugin,
  Root,
  Container,
  ChildNode,
  Comment,
} from 'postcss';

interface Media {
  query: string;
  rule: AtRule;
  container: Container;
}

type Filter = (query: string, media: Media) => boolean;

type FilterSpec = string | RegExp | (string | RegExp)[] | Filter;

function resolveFilter(
  spec: FilterSpec | undefined,
  defaults: boolean,
): Filter {
  if (!spec) return () => defaults;
  if (typeof spec === 'function') return spec;
  const conditions = Array.isArray(spec) ? spec : [spec];
  return (layerName) => {
    return conditions.some((condition) => {
      return typeof condition === 'string'
        ? layerName.includes(condition)
        : condition.test(layerName);
    });
  };
}

type SortMedia = (a: Media, b: Media) => number;

export interface OptimizeMediaOptions {
  include?: FilterSpec;
  exclude?: FilterSpec;
  sort?: SortMedia;
}

// const MEDIA_WIDTH_MATCH_RE = /\((min|max)-width:(\d+)px\)/;

// const MEDIA_RANGE_TYPES = ['min', 'max', 'minmax'] as const;

// type MediaRangeType = typeof MEDIA_RANGE_TYPES[number];

// function getMediaRangeType(range: { min?: number; max?: number }): MediaRangeType {
//   const { min, max } = range;
//   const hasMin = min != null;
//   const hasMax = max != null;

//   if (!hasMin && !hasMax) throw new Error('missing amount');
//   if (hasMin && hasMax) return 'minmax';
//   if (hasMin) return 'min';
//   return 'max';
// }

// function getMediaRangeTypeAndScore(range: { min?: number; max?: number }): {
//   type: MediaRangeType;
//   score: number;
// } {
//   const type = getMediaRangeType(range);
//   return {
//     type,
//     score: MEDIA_RANGE_TYPES.indexOf(type),
//   }
// }

// function parseMediaRange(query: string): MediaWidthRange {
//   let min: number | undefined;
//   let max: number | undefined;
//   const chunks = query.split(' and ').map((chunk) => chunk.replace(/\s/g, ''));
//   chunks.forEach((chunk) => {
//     const widthMatch = chunk.match(MEDIA_WIDTH_MATCH_RE);
//     if (!widthMatch) return;
//     const type = widthMatch[1] as 'min' | 'max';
//     const amount = Number(widthMatch[2]);
//     if (type === 'min') {
//       min = amount;
//     } else if (type === 'max') {
//       max = amount;
//     }
//   });
//   return { min, max };
// }

function parseMedia(mediaRule: AtRule): Media {
  const { params, parent } = mediaRule;
  if (!parent) {
    throw mediaRule.error('@media rules require a parent container.');
  }
  return {
    query: params,
    rule: mediaRule,
    container: parent,
  };
}

function isSourceMapAnnotation(node: ChildNode | undefined): node is Comment {
  if (!node) return false;
  if (node.type !== 'comment') return false;
  return node.text.toLowerCase().startsWith('# sourcemappingurl=');
}

function getSourceMapAnnotation(container: Container): ChildNode | undefined {
  const maybeAnnotation = container.last;
  if (isSourceMapAnnotation(maybeAnnotation)) {
    return maybeAnnotation;
  }
}

export function optimizeMedia(
  css: string | { toString(): string } | Root,
  opts: OptimizeMediaOptions = {},
): Root {
  const root = css instanceof Root ? css : postcss.parse(css);
  const include = resolveFilter(opts.include, true);
  const exclude = resolveFilter(opts.exclude, false);

  const sourceMap = getSourceMapAnnotation(root);

  const containerMap = new Map<Container, Media[]>();

  root.walkAtRules('media', (mediaRule) => {
    const media = parseMedia(mediaRule);
    if (
      !mediaRule.nodes ||
      !include(media.query, media) ||
      exclude(media.query, media)
    )
      return;

    let bucket = containerMap.get(media.container);
    if (!bucket) {
      bucket = [];
      containerMap.set(media.container, bucket);
    }
    bucket.push(media);
  });

  containerMap.forEach((bucket, container) => {
    if (opts.sort) {
      bucket.sort(opts.sort);
    }

    const combinedRules: {
      query: string;
      medias: Media[];
    }[] = [];

    bucket.forEach((media) => {
      let rule = combinedRules.find((r) => r.query === media.query);
      if (!rule) {
        rule = { query: media.query, medias: [] };
        combinedRules.push(rule);
      }
      rule.medias.push(media);
    });

    combinedRules.forEach((rule) => {
      const nodes = rule.medias
        .map((media) => media.rule.nodes.map((node) => node.clone()))
        .flat();
      const newAtRule = new AtRule({
        name: 'media',
        params: rule.query,
        nodes,
      });
      rule.medias.forEach((media) => media.rule.remove());
      container.append(newAtRule);
    });
  });

  containerMap.clear();

  if (sourceMap) {
    root.append(sourceMap);
  }

  return root;
}

const PLUGIN_NAME = 'optimize-media';

export function OptimizeMedia(opts?: OptimizeMediaOptions): Plugin {
  return {
    postcssPlugin: PLUGIN_NAME,
    Once(root) {
      optimizeMedia(root, opts);
    },
  };
}

OptimizeMedia.postcss = true;

export default OptimizeMedia;
