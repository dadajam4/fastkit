import {
  RouteLocation,
  RouteLocationNormalizedLoaded,
  stringifyQuery,
  RouterView,
  RouteLocationMatched,
} from 'vue-router';

import { isObject } from '@fastkit/helpers';
export interface ResolvedRouteLocation extends RouteLocation {
  href: string;
}

type InstanceOf<T> = T extends new (...args: any[]) => infer R ? R : never;

export type RouterViewSlotProps = Parameters<
  InstanceOf<typeof RouterView>['$slots']['default']
>[0];

export type WatchQueryOption = boolean | string[];

export function parseWatchQueryOption(
  route: RouteLocationNormalizedLoaded,
  opts?: WatchQueryOption,
): string {
  // if (!opts) return route.path;
  if (opts === true) {
    opts = Object.keys(route.query);
  }
  if (!opts || !opts.length) return '';
  const query: RouteLocationNormalizedLoaded['query'] = {};
  opts.forEach((row) => {
    query[row] = route.query[row];
  });
  const queryStr = stringifyQuery(query);
  // let key = route.path;
  let key = '&';
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

export function generateWatchQueryKeySuffix(
  routeProps: RouterViewSlotProps,
): string {
  const option = extractWatchQueryOption(routeProps.Component);
  return parseWatchQueryOption(routeProps.route, option);
}

const interpolatePath = (
  route: RouteLocationNormalizedLoaded,
  match: RouteLocationMatched,
) => {
  return match.path
    .replace(/(:\w+)\([^)]+\)/g, '$1')
    .replace(/(:\w+)[?+*]/g, '$1')
    .replace(/:\w+/g, (r) => route.params[r.slice(1)]?.toString() || '');
};

export const generateRouteKey = (
  override: string | ((route: RouteLocationNormalizedLoaded) => string),
  routeProps: RouterViewSlotProps,
) => {
  const matchedRoute = routeProps.route.matched.find(
    (m) => m.components.default === routeProps.Component.type,
  );
  if (!matchedRoute) {
    return '';
  }
  const source =
    override ??
    matchedRoute?.meta.key ??
    interpolatePath(routeProps.route, matchedRoute);
  return typeof source === 'function' ? source(routeProps.route) : source;
};

export const generateRouteKeyWithWatchQuery = (
  override: string | ((route: RouteLocationNormalizedLoaded) => string),
  routeProps: RouterViewSlotProps,
) => {
  const routeKey = generateRouteKey(override, routeProps);
  if (!routeKey) return routeKey;
  return `${routeKey}${generateWatchQueryKeySuffix(routeProps)}`;
};
