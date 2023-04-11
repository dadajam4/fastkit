import {
  reactive,
  watch,
  WatchCallback,
  WatchOptions,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import type {
  Router,
  _RouteLocationBase,
  RouteLocationRaw,
  LocationQueryRaw,
  RouteLocationNormalizedLoaded,
} from 'vue-router';
import {
  isSameRoute,
  SameRouteCheckOptions,
  getRouteQuery,
  RouteQueryType,
  getQueryMergedLocation,
} from '@fastkit/vue-utils';

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

export interface LocationTransitioning {
  path?: boolean;
  query: string[];
  hash?: boolean;
}

export interface LocationServiceState {
  transitioningTo: _RouteLocationBase | null;
}

export interface LocationServiceContext {
  router: Router;
}

export class LocationService {
  readonly state: LocationServiceState;
  readonly router: Router;

  get currentRoute() {
    return this.router.currentRoute.value;
  }

  watchRoute<Immediate extends Readonly<boolean> = false>(
    cb: WatchCallback<
      RouteLocationNormalizedLoaded,
      Immediate extends true
        ? RouteLocationNormalizedLoaded | undefined
        : RouteLocationNormalizedLoaded
    >,
    options?: WatchOptions<Immediate> & { autoStop?: boolean },
  ) {
    let stoped = false;
    let autoStop = options && options.autoStop;
    if (autoStop == null) {
      autoStop = true;
    }

    const stopHandle = watch(
      this.router.currentRoute,
      (currentRoute, oldValue, onInvalidate) => {
        if (stoped) return;
        if (autoStop) {
          nextTick(() => {
            if (stoped) return;
            cb(currentRoute, oldValue, onInvalidate);
          });
        } else {
          cb(currentRoute, oldValue, onInvalidate);
        }
      },
      options,
    );

    if (autoStop) {
      onBeforeUnmount(() => {
        stoped = true;
        stopHandle();
      });
    }

    return stopHandle;
  }

  get transitioningTo() {
    return this.state.transitioningTo;
  }

  get transitioning(): LocationTransitioning | null {
    const { currentRoute, transitioningTo } = this;
    if (!transitioningTo) {
      return null;
    }

    const { path: ap, query: aq, hash: ah } = transitioningTo;
    const { path: bp, query: bq, hash: bh } = currentRoute;

    const transitioning: LocationTransitioning = {
      path: ap !== bp,
      query: [],
      hash: ah !== bh,
    };

    const allQueries = Array.from(
      new Set([...Object.keys(aq), ...Object.keys(bq)]),
    );

    allQueries.forEach((query) => {
      if (aq[query] !== bq[query]) {
        transitioning.query.push(query);
      }
    });

    return transitioning;
  }

  constructor(ctx: LocationServiceContext) {
    const { router } = ctx;

    this.router = router;
    this.state = reactive<LocationServiceState>({
      transitioningTo: null,
    }) as LocationServiceState;

    router.beforeEach((to) => {
      this.state.transitioningTo = to;
    });
    router.afterEach(() => {
      this.state.transitioningTo = null;
    });
    router.onError(() => {
      this.state.transitioningTo = null;
    });
  }

  isQueryOnlyTransitioning(queries?: string | string[]) {
    const { transitioning } = this;
    if (!transitioning) return false;

    const transitioningQuery = transitioning.query;
    if (!transitioningQuery.length) return false;
    if (!queries) return true;

    if (!Array.isArray(queries)) queries = [queries];

    let isTransitioning = false;

    for (const query of queries) {
      if (transitioningQuery.includes(query)) {
        isTransitioning = true;
      }
    }

    return isTransitioning;
  }

  match(raw?: RouteLocationRaw, opts?: SameRouteCheckOptions) {
    if (!raw) return false;
    const route = this.router.resolve(raw);
    return isSameRoute(this.currentRoute, route, opts);
  }

  getMatchedComponents(raw?: RouteLocationRaw) {
    const route = raw
      ? this.router.resolve(raw)
      : this.router.currentRoute.value;
    return route.matched.flatMap((record) =>
      Object.values(record.components || {}),
    );
  }

  isAvailable(raw?: RouteLocationRaw) {
    if (!raw) return false;
    return this.getMatchedComponents(raw).length > 0;
  }

  getQuery(key: string): string | undefined;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: undefined, defaultValue: string): string;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: StringConstructor): string | undefined;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: StringConstructor, defaultValue: string): string;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: NumberConstructor): number | undefined;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: NumberConstructor, defaultValue: number): number;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: BooleanConstructor): boolean;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(
    key: string,
    type: BooleanConstructor,
    defaultValue: boolean,
  ): boolean;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(
    key: string,
    type: RouteQueryType = String,
    defaultValue?: string | number | boolean,
  ): string | number | boolean | undefined {
    return getRouteQuery(
      this.currentRoute.query,
      key,
      type as any,
      defaultValue as any,
    );
  }

  getQueryMergedLocation(
    query: LocationQueryRaw,
    route = this.currentRoute,
  ): _RouteLocationBase {
    return getQueryMergedLocation(query, route);
  }

  push(...args: Parameters<Router['push']>) {
    return this.router.push(...args);
  }

  pushQuery(query: LocationQueryRaw) {
    return this.push(this.getQueryMergedLocation(query));
  }

  replace(...args: Parameters<Router['replace']>) {
    return this.router.replace(...args);
  }

  replaceQuery(query: LocationQueryRaw) {
    return this.replace(this.getQueryMergedLocation(query));
  }

  go(...args: Parameters<Router['go']>) {
    return this.router.go(...args);
  }

  back(...args: Parameters<Router['back']>) {
    return this.router.back(...args);
  }

  forward(...args: Parameters<Router['forward']>) {
    return this.router.forward(...args);
  }
}
