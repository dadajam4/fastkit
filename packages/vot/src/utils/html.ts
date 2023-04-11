export function findDependencies(
  modules: string[],
  manifest: Record<string, string[]>,
  excludes?: string[],
) {
  const files = new Set<string>();

  for (const id of modules || []) {
    for (const file of manifest[id] || []) {
      if (excludes && excludes.includes(file)) {
        continue;
      }
      files.add(file);
    }
  }

  return [...files];
}

export function renderPreloadLinks(files: string[]) {
  let link = '';

  for (const file of files || []) {
    if (file.endsWith('.js')) {
      link += `<link rel="modulepreload" crossorigin href="${file}">`;
    } else if (file.endsWith('.css')) {
      link += `<link rel="stylesheet" href="${file}">`;
    }
  }

  return link;
}

const containerId = __VOT_CONTAINER_ID__;

const containerRE = new RegExp(
  `<div id="${containerId}"([\\s\\w\\-"'=[\\]]*)><\\/div>`,
);

type DocParts = {
  htmlAttrs?: string;
  bodyAttrs?: string;
  headTags?: string;
  body?: string;
  initialState?: string;
  bodyPrepend?: string;
};

const BODY_PREPEND_MATCH_RE = /<body([^>]*)>/;

export function buildHtmlDocument(
  template: string,
  { htmlAttrs, bodyAttrs, headTags, body, initialState, bodyPrepend }: DocParts,
) {
  if (__PLUGBOY_DEV__) {
    if (template.indexOf(`id="${containerId}"`) === -1) {
      console.warn(
        `[SSR] Container with id "${containerId}" was not found in index.html`,
      );
    }
  }

  if (htmlAttrs) {
    template = template.replace('<html', `<html ${htmlAttrs} `);
  }

  if (bodyAttrs) {
    template = template.replace('<body', `<body ${bodyAttrs} `);
  }

  if (headTags) {
    template = template.replace('</head>', `\n${headTags}\n</head>`);
  }

  let html = template.replace(
    containerRE,
    // Use function parameter here to avoid replacing `$1` in body or initialState.
    (_, d1) =>
      `<div id="${containerId}" data-server-rendered="true"${d1 || ''}>${
        body || ''
      }</div>\n\n  <script>window.__INITIAL_STATE__=${
        initialState || "'{}'"
      }</script>`,
  );

  if (bodyPrepend) {
    const bodyStart = html.match(BODY_PREPEND_MATCH_RE)?.[0];
    if (bodyStart) {
      html = html.replace(bodyStart, `${bodyStart}${bodyPrepend}`);
    }
  }
  return html;
}

const HEAD_MATCH_RE = /<\s*?head(\s+[^>]+)?\s*?>([\s\S]*?)<\/\s*?head\s*?>/;

const ASSET_MATCH_RE = /<\s*?(script|link)[^>]+href="([^"]+)"/g;

const HREF_MATCH_RE = /href="([^"]+)"/;

export function extractHeadAssets(html: string) {
  const head = html.match(HEAD_MATCH_RE)?.[0] || '';
  const assets =
    head
      .match(ASSET_MATCH_RE)
      ?.map((code) => {
        return code.match(HREF_MATCH_RE)?.[1];
      })
      .filter((asset): asset is string => !!asset) || [];
  return assets;
}
