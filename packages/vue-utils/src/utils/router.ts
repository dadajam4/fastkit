import type { ComponentPublicInstance } from 'vue';
import type {
  /*RouterScrollBehavior, */ RouteLocationNormalized,
  RouteComponent,
  RouteRecordNormalized,
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
