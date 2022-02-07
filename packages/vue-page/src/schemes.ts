import {
  RouteLocation,
  RouteLocationNormalizedLoaded,
  stringifyQuery,
} from 'vue-router';

import { isObject } from '@fastkit/helpers';
export interface ResolvedRouteLocation extends RouteLocation {
  href: string;
}

export type WatchQueryOption = boolean | string[];

export function parseWatchQueryOption(
  route: RouteLocationNormalizedLoaded,
  opts?: WatchQueryOption,
): string {
  // if (!opts) return route.path;
  if (!opts) return '';
  if (opts === true) return route.fullPath;
  const query: RouteLocationNormalizedLoaded['query'] = {};
  opts.forEach((row) => {
    query[row] = route.query[row];
  });
  const queryStr = stringifyQuery(query);
  let key = route.path;
  if (queryStr) {
    key += `?${queryStr}`;
  }
  return key;
}

export function extractWatchQueryOption(
  source: any,
): WatchQueryOption | undefined {
  if (!isObject<any>(source)) return;
  if (source.watchQuery) return source.watchQuery;
  if (isObject(source.type) && source.type.watchQuery) {
    return source.type.watchQuery;
  }
}

export function generateWatchQueryKey(
  route: RouteLocationNormalizedLoaded,
  source: any,
): string {
  const option = extractWatchQueryOption(source);
  return parseWatchQueryOption(route, option);
}
