import type { ComponentPublicInstance } from 'vue';
import type {
  /*RouterScrollBehavior, */ RouteLocationNormalized,
  RouteComponent,
  RouteRecordNormalized,
  LocationQueryRaw,
  RouteLocationNormalizedLoaded,
} from 'vue-router';

type RawRouteComponent = RouteComponent | (() => Promise<RouteComponent>);

export function getRouteMatchedComponents<
  P extends 'components' = 'components',
>(
  route: RouteLocationNormalized,
  matches: false | number[] = false,
  prop: P = 'components' as P,
) {
  const values = route.matched.map((m, index) => {
    return Object.values(m[prop]).map((v) => {
      matches && matches.push(index);
      return v;
    });
  });
  return [...values].flat();
}

// async function resolveRouteComponent(Component: RawRouteComponent) {
//   if (typeof Component === 'function') {
//     Component = await Component();

//   }
// }

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
    Object.entries(components).forEach(([key, Component]) => {
      if (!Component) return;
      const instance = instances[key] || null;
      results.push({ Component, instance, route, key, index });
    });
  });

  return results;
}

function getMergedQuery(query: LocationQueryRaw, overrides: LocationQueryRaw) {
  const _query = JSON.parse(JSON.stringify(overrides)) as LocationQueryRaw;

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      const values = value.map((v) => {
        if (typeof v === 'number') v = String(v);
        return v;
      });
      _query[key] = values;
    } else if (value === null) {
      delete _query[key];
    } else {
      if (typeof value === 'number') value = String(value);
      _query[key] = value;
    }
  });
  return _query;
}
export function getQueryMergedLocation(
  query: LocationQueryRaw,
  route: RouteLocationNormalizedLoaded,
) {
  return {
    // name: route.name,
    path: route.path,
    // ...route,
    query: getMergedQuery(query, route.query),
  };
}

type QueryType = StringConstructor | NumberConstructor | BooleanConstructor;

export function getRouteQuery(bucket: LocationQueryRaw, key: string): string | undefined; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: undefined, defaultValue: string): string; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: StringConstructor): string | undefined; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: StringConstructor, defaultValue: string): string; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: NumberConstructor): number | undefined; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: NumberConstructor, defaultValue: number): number; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: BooleanConstructor): boolean; // eslint-disable-line prettier/prettier
export function getRouteQuery(bucket: LocationQueryRaw, key: string, type: BooleanConstructor, defaultValue: boolean): boolean; // eslint-disable-line prettier/prettier
export function getRouteQuery(
  bucket: LocationQueryRaw,
  key: string,
  type: QueryType = String,
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
