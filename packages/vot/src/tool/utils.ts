import fs from 'fs';
import path from 'path';
import { resolveConfig, ResolvedConfig } from 'vite';
import { VotPluginOptions } from '../vot';
import {
  PageContext,
  UserOptions as PagesUserOptions,
} from 'vite-plugin-pages';
import type { ExtractedPage, VotExtractedPage } from '../schemes/page';

export const INDEX_HTML = 'index.html';

export function getPluginOptions(viteConfig: ResolvedConfig) {
  return ((
    viteConfig.plugins.find((plugin) => plugin.name === 'vite:vot') as any
  )?.votOptions || {}) as VotPluginOptions;
}

export async function resolveViteConfig(mode?: string) {
  return resolveConfig(
    {},
    'build',
    mode || process.env.MODE || process.env.NODE_ENV,
  );
}

export async function getEntryPoint(
  config?: ResolvedConfig,
  indexHtml?: string,
) {
  if (!config) {
    config = await resolveViteConfig();
  }

  if (!indexHtml) {
    indexHtml = await fs.promises.readFile(
      getPluginOptions(config).input || path.resolve(config.root, INDEX_HTML),
      'utf-8',
    );
  }

  const matches = indexHtml
    .substr(indexHtml.lastIndexOf('script type="module"'))
    .match(/src="(.*)">/i);

  let entryFile = matches?.[1] || 'src/main';

  if (config.base) {
    // Supports base path for entry...
    entryFile = entryFile.replace(new RegExp(`^${config.base}`), '');
  }

  return path.join(config.root, entryFile);
}

function resolvePagesOptions(options: VotPluginOptions = {}): PagesUserOptions {
  const { pages } = options;
  return {
    pagesDir: 'src/pages',
    extensions: ['vue', 'ts', 'tsx'],
    ...pages,
  };
}

function extractDynamicParams(path: string): string[] | undefined {
  const dynamicParams: string[] = [];
  const chunks = path.split('/');
  chunks.forEach((chunk) => {
    if (chunk && chunk.startsWith(':')) {
      dynamicParams.push(chunk.replace(':', ''));
    }
  });
  return dynamicParams.length ? dynamicParams : undefined;
}

function resolveExtractedPage(
  page: ExtractedPage,
  parents: ExtractedPage[] = [],
): VotExtractedPage {
  const { name, path, props, children } = page;
  const fullPathPrefix = parents.length
    ? `${parents.map(({ path }) => path).join('/')}/`
    : '';
  const fullPath = `${fullPathPrefix}${path}`;
  const resolved: VotExtractedPage = {
    name,
    path,
    fullPath,
    props,
  };
  const dynamicParams = extractDynamicParams(fullPath);
  if (dynamicParams) {
    resolved.dynamicParams = dynamicParams;
  }
  if (children) {
    resolved.children = resolveExtractedPages(children, [...parents, page]);
  }
  return resolved;
}

function resolveExtractedPages(
  pages: ExtractedPage[],
  parents?: ExtractedPage[],
): VotExtractedPage[] {
  return pages.map((page) => resolveExtractedPage(page, parents));
}

export async function extractPages(options: VotPluginOptions = {}): Promise<{
  pages: VotExtractedPage[];
  flat: () => VotExtractedPage[];
}> {
  const pageCtx = new PageContext(resolvePagesOptions(options));
  await pageCtx.searchGlob();
  let code = await pageCtx.resolveRoutes();
  if (!code) {
    throw new Error('missing pages.');
  }

  code = code.replace(/,"component":(.*?),/g, ',');
  code = code.replace(/import ([\s\S]*?)const routes = ?/, '');
  code = code.replace(/export default routes;?/, '');
  code = code.trim().replace(/];/, ']');

  const pages = eval(code) as ExtractedPage[];
  const resolved: VotExtractedPage[] = resolveExtractedPages(pages);

  const _flat = (pages: VotExtractedPage[]) => {
    const flattened: VotExtractedPage[] = [];
    pages.forEach((page) => {
      flattened.push(page);
      if (page.children) {
        flattened.push(..._flat(page.children));
      }
    });
    return flattened;
  };

  const flat = () => _flat(resolved);

  return {
    pages: resolved,
    flat,
  };
}
