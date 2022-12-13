import { VotExtractedPage } from './page';

export type VotGenerateMode = 'off' | 'static'; // | 'incremental';

export interface VotGenerateParams {
  path?: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
}

export type VotGenerateConditionResult =
  | void
  | VotGenerateParams
  | string
  | boolean
  | (VotGenerateParams | string)[];

export type VotGenerateHandler = (
  page: VotExtractedPage,
) => VotGenerateConditionResult;

export interface VotGenerateOptions {
  mode: VotGenerateMode;
  handler: VotGenerateHandler;
  outputSync?: string;
}

export type RawVotGenerateOptions =
  | boolean
  | VotGenerateHandler
  | Partial<VotGenerateOptions>;

const DEFAULT_GENERATE_HANDLER: VotGenerateHandler = (page) => {
  return !page.dynamicParams;
};

export function resolveRawVotGenerateOptions(
  source: RawVotGenerateOptions | undefined,
): VotGenerateOptions {
  if (!source) {
    return { mode: 'off', handler: DEFAULT_GENERATE_HANDLER };
  }
  if (typeof source === 'function') {
    source = { handler: source };
  }
  if (source === true) {
    source = {};
  }

  const {
    mode = 'static',
    handler = DEFAULT_GENERATE_HANDLER,
    outputSync,
  } = source;
  return {
    mode,
    handler,
    outputSync,
  };
}

export function generateVotGeneratePagePaths(
  opts: VotGenerateOptions,
  pages: VotExtractedPage[],
) {
  const { handler } = opts;
  const results: string[] = [];
  pages.forEach((page) => {
    const { path: fullPath } = page;
    if (!fullPath) return;
    const result = handler(page);
    if (!result) return;
    if (result === true) {
      results.push(fullPath);
      return;
    }
    const items = Array.isArray(result) ? result : [result];

    items.forEach((item) => {
      const _params: VotGenerateParams =
        typeof item === 'string' ? { path: item } : item;
      let { path = fullPath } = _params;
      const { query, params } = _params;
      params &&
        Object.entries(params).forEach(([key, value]) => {
          path = path.replace(/(\/|^):(.+?)(\/|$)/, `$1${value}$3`);
        });
      const queryStr = query
        ? Object.entries(query)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
        : '';
      if (queryStr) {
        path = `?${queryStr}`;
      }
      results.push(path);
    });
  });
  return results;
}

export const VOT_GENERATE_PAGES_PATH = '__VOT_GENERATE_PAGES__';
