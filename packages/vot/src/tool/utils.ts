import fs from 'node:fs';
import path from 'node:path';
import { resolveConfig, ResolvedConfig, Plugin } from 'vite';
import { VotPluginOptions } from '../vot';
import type { RouteRecord } from 'vue-router';
import type { VotExtractedPage } from '../schemes/page';
import {
  resolveRawVotGenerateOptions,
  VotGenerateOptions,
} from '../schemes/generate';

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
  route: RouteRecord,
): VotExtractedPage | undefined {
  if (route.redirect) return;
  const { path, name } = route;
  const resolved: VotExtractedPage = {
    name,
    path,
  };
  const dynamicParams = extractDynamicParams(path);
  if (dynamicParams) {
    resolved.dynamicParams = dynamicParams;
  }
  return resolved;
}

export function resolveExtractedPages(
  routes: RouteRecord[],
): VotExtractedPage[] {
  const pages: VotExtractedPage[] = [];
  routes.map(resolveExtractedPage).forEach((page) => {
    page && pages.push(page);
  });
  return pages;
}

export function findPlugin(
  pluginName: string,
  buckets: readonly Plugin[] | Plugin[],
): Plugin | undefined {
  for (const row of buckets) {
    if (Array.isArray(row)) {
      const hit = findPlugin(pluginName, row);
      if (hit) return hit;
    }
    if (row.name === pluginName) {
      return row;
    }
  }
}

export function findVotPlugin(buckets: readonly Plugin[] | Plugin[]):
  | {
      plugin: Plugin;
      options: VotPluginOptions;
      generateOptions: VotGenerateOptions;
    }
  | undefined {
  const plugin = findPlugin('vite:vot', buckets);
  if (!plugin) return;

  const options: VotPluginOptions = (plugin as any).__options__;

  if (!options) {
    throw new Error('missing vot plugin options.');
  }

  const generateOptions = resolveRawVotGenerateOptions(options.generate);
  return {
    plugin,
    options,
    generateOptions,
  };
}
