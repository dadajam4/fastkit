import type { _RouteLocationBase, Router, RouteLocationRaw } from 'vue-router';

function clone<T>(source: T): T {
  return JSON.parse(JSON.stringify(source));
}

export function pickShallowRoute(
  route: _RouteLocationBase,
): _RouteLocationBase {
  return {
    path: route.path,
    name: route.name,
    hash: route.hash,
    query: clone(route.query),
    params: clone(route.params),
    fullPath: route.fullPath,
    redirectedFrom: route.redirectedFrom,
    meta: clone(route.meta),
  };
}

const normalizePath = (path: string) =>
  path.endsWith('/') ? path : `${path}/`;

export function locationIsMatched(router: Router, target: RouteLocationRaw) {
  const currentRoute = router.currentRoute.value;
  const _target = router.resolve(target);
  const { path } = currentRoute;
  if (normalizePath(_target.path) !== normalizePath(path)) return false;
  const { query, hash } = _target;
  const queryEntries = Object.entries(query);
  if (queryEntries.some(([key, value]) => currentRoute.query[key] !== value)) {
    return false;
  }
  if (hash && currentRoute.hash !== hash) return false;
  return true;
}
