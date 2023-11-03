import type { _RouteLocationBase } from 'vue-router';

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
