import {
  type RouteLocationPathRaw,
  type RouteLocationRaw,
  type RouteLocationNamedRaw,
  parseQuery,
} from 'vue-router';

const EXTERNAL_LOCATION_RE = /^([a-z][a-z\d+\-.]*:|\/\/)/i;

/**
 * Check if the location string points outside the router, i.e. it has a protocol (`https:`, `tel:`, `mailto:`, ...) or is protocol-relative (`//example.com`)
 *
 * @param locationStr - location string
 * @returns `true` if the location is external
 */
export function isExternalLocation(locationStr: string) {
  return EXTERNAL_LOCATION_RE.test(locationStr);
}

function locationStringToPathRaw(locationStr: string): RouteLocationPathRaw {
  const hashIndex = locationStr.indexOf('#');
  const pathWithSearch =
    hashIndex === -1 ? locationStr : locationStr.slice(0, hashIndex);
  const searchIndex = pathWithSearch.indexOf('?');
  const path =
    searchIndex === -1 ? pathWithSearch : pathWithSearch.slice(0, searchIndex);
  const raw: RouteLocationPathRaw = { path };
  if (hashIndex !== -1) {
    // Vue Router expects the hash to keep its leading `#`
    raw.hash = locationStr.slice(hashIndex);
  }
  if (searchIndex !== -1) {
    raw.query = parseQuery(pathWithSearch.slice(searchIndex + 1));
  }
  return raw;
}

const RELATIVE_PATH_RE = /^(\.\/|\.\.\/|[^/])/;

function isRelativePath(str: string) {
  return !str || (RELATIVE_PATH_RE.test(str) && !isExternalLocation(str));
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
 * If a path string is detected at the specified location and it contains a relative path, it merges with the current specified path and normalizes the location information.
 *
 * @param raw - User-level route location
 * @param currentPath - current path
 * @returns resolved location
 */
export function resolveRelativeLocationRaw(
  raw: RouteLocationRaw,
  currentPath: string,
): RouteLocationPathRaw | RouteLocationNamedRaw {
  let obj = typeof raw === 'string' ? locationStringToPathRaw(raw) : raw;
  if ('path' in obj && obj.path && isRelativePath(obj.path)) {
    obj = {
      ...obj,
      path: resolveRelativePath(currentPath, obj.path),
    };
  }
  return obj;
}
