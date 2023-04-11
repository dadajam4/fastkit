import {
  stringifyQuery,
  RouteLocationMatched,
  RouteLocationNormalized,
} from 'vue-router';
import {
  WatchQueryOption,
  RouterViewSlotProps,
  VuePageKeyOverride,
} from './schemes';
import { isObject, IN_WINDOW } from '@fastkit/helpers';
import { RouteMatchedItem, RawRouteComponent } from '@fastkit/vue-utils';

export function parseWatchQueryOption(
  route: RouteLocationNormalized,
  opts?: WatchQueryOption,
): string {
  // if (!opts) return route.path;
  if (opts === true) {
    opts = Object.keys(route.query);
  }
  if (!opts || !opts.length) return '';
  const query: RouteLocationNormalized['query'] = {};
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

export function generateWatchQueryKeySuffix(routeProps: {
  Component: RouterViewSlotProps['Component'] | RawRouteComponent;
  route: RouteLocationNormalized;
}): string {
  const option = extractWatchQueryOption(routeProps.Component);
  return parseWatchQueryOption(routeProps.route, option);
}

const interpolatePath = (
  route: {
    params: RouteLocationNormalized['params'];
  },
  match: {
    path: RouteLocationMatched['path'];
  },
) => {
  return match.path
    .replace(/(:\w+)\([^)]+\)/g, '$1')
    .replace(/(:\w+)[?+*]/g, '$1')
    .replace(/:\w+/g, (r) => route.params[r.slice(1)]?.toString() || '');
};

export const generateRouteKey = (
  routeProps: RouterViewSlotProps,
  override?: VuePageKeyOverride,
): string => {
  const matchedRoute = routeProps.route.matched.find(
    (m) =>
      routeProps.Component &&
      m.components?.default === routeProps.Component.type,
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
  routeProps: RouterViewSlotProps,
  override?: VuePageKeyOverride,
) => {
  const routeKey = generateRouteKey(routeProps, override);
  if (!routeKey) return routeKey;
  return `${routeKey}${generateWatchQueryKeySuffix(routeProps)}`;
};

export function routeKeyWithWatchQueryByRouteItem(
  route: RouteLocationNormalized,
  item: RouteMatchedItem,
) {
  const routeKey = interpolatePath(route, item.route);
  const routeProps = {
    Component: item.Component,
    route,
  };
  return `${routeKey}${generateWatchQueryKeySuffix(routeProps)}`;
}

let __forcePrefetchStates: {
  [pageKey: string]: boolean;
} = {};

export function getForcePrefetchStates(pageKey: string) {
  return __forcePrefetchStates[pageKey];
}

export function consumeForcePrefetchStates(pageKey: string) {
  const value = getForcePrefetchStates(pageKey);
  setForcePrefetchStates(pageKey, false);
  return value;
}

export function setForcePrefetchStates(pageKey: string, value: boolean) {
  if (IN_WINDOW) return;
  if (value) {
    __forcePrefetchStates[pageKey] = value;
  } else {
    delete __forcePrefetchStates[pageKey];
  }
}

export function resetForcePrefetchStates() {
  __forcePrefetchStates = {};
}
