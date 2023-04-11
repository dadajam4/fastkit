import type { ComponentPublicInstance } from 'vue';
import type {
  /*RouterScrollBehavior, */ RouteLocationNormalized,
  RouteComponent,
  RouteRecordNormalized,
  LocationQueryRaw,
  RouteLocationNormalizedLoaded,
  _RouteLocationBase,
  LocationQuery,
  Router,
  RouteLocation,
} from 'vue-router';
import { isObjectEqual } from '@fastkit/helpers';

export type RawRouteComponent =
  | RouteComponent
  | (() => Promise<RouteComponent>);

export function getRouteMatchedComponents<
  P extends 'components' = 'components',
>(
  route: RouteLocationNormalized,
  matches: false | number[] = false,
  prop: P = 'components' as P,
) {
  const values = route.matched.map((m, index) => {
    return Object.values(m[prop] || {}).map((v) => {
      matches && matches.push(index);
      return v;
    });
  });
  return [...values].flat();
}

export interface RouteMatchedItem {
  Component: RawRouteComponent;
  instance: ComponentPublicInstance | null;
  route: RouteRecordNormalized;
  key: string;
  index: number;
}

export function extractRouteMatchedItems(route: RouteLocationNormalized) {
  const results: RouteMatchedItem[] = [];

  route.matched.forEach((route, index) => {
    const { components, instances } = route;
    if (!components) return;
    Object.entries(components).forEach(([key, Component]) => {
      if (!Component) return;
      const instance = instances[key] || null;
      results.push({ Component, instance, route, key, index });
    });
  });

  return results;
}

export function getMergedRouteQuery(
  query: LocationQueryRaw,
  overrides: LocationQuery,
) {
  const _query = JSON.parse(JSON.stringify(overrides)) as LocationQuery;

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const values = value.map((v) => {
        if (typeof v === 'number') v = String(v);
        return v;
      });
      _query[key] = values as string[];
    } else if (value === null) {
      delete _query[key];
    } else {
      if (typeof value === 'number') value = String(value);
      _query[key] = value as string;
    }
  });
  return _query;
}
export function getQueryMergedLocation(
  query: LocationQueryRaw,
  route: RouteLocationNormalizedLoaded,
): _RouteLocationBase {
  return {
    ...route,
    query: getMergedRouteQuery(query, route.query),
  };
}

export type RouteQueryType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor;

export function getRouteQuery(bucket: LocationQuery, key: string): string | undefined; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: undefined, defaultValue: string): string; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: StringConstructor): string | undefined; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: StringConstructor, defaultValue: string): string; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: NumberConstructor): number | undefined; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: NumberConstructor, defaultValue: number): number; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: BooleanConstructor): boolean; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQuery, key: string, type: BooleanConstructor, defaultValue: boolean): boolean; // eslint-disable-line prettier/prettier
export function getRouteQuery(
  bucket: LocationQuery,
  key: string,
  type: RouteQueryType = String,
  defaultValue?: string | number | boolean,
): string | number | boolean | undefined {
  const _value = bucket[key];
  const value = Array.isArray(_value) ? _value[0] : _value;
  if (type === String) {
    return value != null ? value : defaultValue;
  } else if (type === Number) {
    if (value != null) {
      const parsed = Number(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return defaultValue;
  } else if (type === Boolean) {
    if (value != null) {
      const lower = String(value).toLowerCase().trim();
      if (['1', 'true', 'on'].includes(lower)) return true;
      if (['0', '-1', 'false', 'off'].includes(lower)) return false;
    }
    return defaultValue;
  }
}

export const trailingSlashRE = /\/?$/;

export function removeTrailingSlash(str: string) {
  return str.replace(trailingSlashRE, '');
}

export interface SameRouteCheckOptions {
  hash?: boolean;
  query?: boolean;
  params?: boolean;
}

/**
 * @see https://github.com/vuejs/vue-router/blob/c69ff7bd60228fb79acd764c3fdae91015a49103/src/util/route.js#L73
 */
export function isSameRoute(
  a: _RouteLocationBase,
  b?: _RouteLocationBase,
  opts?: SameRouteCheckOptions,
): boolean {
  const includeHash = (opts && opts.hash) || true;
  const includeQuery = (opts && opts.query) || true;
  const includeParams = (opts && opts.params) || true;

  if (!b) {
    return false;
  } else if (a.path && b.path) {
    return (
      removeTrailingSlash(a.path) === removeTrailingSlash(b.path) &&
      (!includeHash || a.hash === b.hash) &&
      (!includeQuery || isObjectEqual(a.query, b.query))
    );
  } else if (a.name && b.name) {
    return (
      a.name === b.name &&
      (!includeHash || a.hash === b.hash) &&
      (!includeQuery || isObjectEqual(a.query, b.query)) &&
      (!includeParams || isObjectEqual(a.params, b.params))
    );
  } else {
    return false;
  }
}

const MOCK_REDIRECT_FN = () => ({ name: '' });

export function createMockPathRoute(
  router: Router,
  path: string,
): RouteLocation & { href: string } {
  const { base } = router.options.history;
  if (path.startsWith(base)) {
    path = path.replace(base, '');
  }

  const release = router.addRoute({
    name: '__mockRoute__',
    path,
    redirect: MOCK_REDIRECT_FN,
  });

  const route = router.resolve(path);
  release();

  return route;
}
