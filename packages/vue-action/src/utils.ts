import {
  RouteLocationPathRaw,
  LocationQueryRaw,
  RouteLocationRaw,
  RouteLocationNamedRaw,
} from 'vue-router';

function locationStringToPathRaw(locationStr: string): RouteLocationPathRaw {
  const [pathWithParams, hash] = locationStr.split('#');
  const [path, search] = pathWithParams.split('?');
  const raw: RouteLocationPathRaw = {
    path,
    hash,
  };
  if (search) {
    const query: LocationQueryRaw = {};
    const rows = search.split('&');
    for (const row of rows) {
      const [key, value] = row.split('=');
      query[key] = value == null ? '' : value;
    }
    raw.query = query;
  }
  return raw;
}

const RELATIVE_PATH_RE = /^(\.\/|\.\.\/|[^/])/;

function isRelativePath(str: string) {
  return !str || RELATIVE_PATH_RE.test(str);
}

const TRIM_SLASH_RE = /(^\/|\/$)/g;

function trimSlash(str: string) {
  return str.replace(TRIM_SLASH_RE, '');
}

const SAME_DEPTH_RE = /^\.\//;

const EXTRACT_RELATIVE_SYMBOLS_RE = /^(\.\.\/)+/g;

const CONSECUTIVE_SLASHES_RE = /\/+/g;

/**
 * Get the path string merged with the specified relative path to the base path
 *
 * - `/a/b/c` , `hoge` → `/a/b/c/hoge`
 * - `/a/b/c/` , `hoge` → `/a/b/c/hoge`
 * - `/a/b/c/` , `./hoge` → `/a/b/c/hoge`
 * - `/a/b/c` , `../hoge` → `/a/b/hoge`
 * - `/a/b/c/` , `../hoge` → `/a/b/hoge`
 * - `/` , `hoge` → `/hoge`
 * - `/` , `./hoge` → `/hoge`
 * - `/` , `../hoge` → `/hoge`
 *
 * @param base - base path
 * @param relativePath - relative path
 * @returns merged path
 */
export function resolveRelativePath(base: string, relativePath: string) {
  base = trimSlash(base);
  relativePath = relativePath.replace(SAME_DEPTH_RE, '');

  const chunks = base.split('/');
  const symbols = relativePath.match(EXTRACT_RELATIVE_SYMBOLS_RE)?.[0];
  const length = symbols ? symbols.split('../').length - 1 : 0;
  const replacedRelativePath = symbols
    ? relativePath.replace(symbols, '')
    : relativePath;
  const slicedChunks = length > 0 ? chunks.slice(0, length * -1) : chunks;

  return `/${slicedChunks.join('/')}/${replacedRelativePath}`.replace(
    CONSECUTIVE_SLASHES_RE,
    '/',
  );
}

/**
 * 指定のロケーションにパス文字列が検出され相対パスが含まれていた場合、指定の現在のパスとマージしロケーション情報を正規化します
 * @param raw - User-level route location
 * @param currentPath - current path
 * @returns resolved location
 */
export function resolveRelativeLocationRaw(
  raw: RouteLocationRaw,
  currentPath: string,
): RouteLocationPathRaw | RouteLocationNamedRaw {
  let obj = typeof raw === 'string' ? locationStringToPathRaw(raw) : raw;
  if ('path' in obj && isRelativePath(obj.path)) {
    obj = {
      ...obj,
      path: resolveRelativePath(currentPath, obj.path),
    };
  }
  return obj;
}
