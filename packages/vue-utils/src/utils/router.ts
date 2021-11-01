import type {
  /*RouterScrollBehavior, */ RouteLocationNormalized,
} from 'vue-router';

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
