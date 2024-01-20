import {
  reactive,
  watch,
  WatchCallback,
  WatchOptions,
  WatchStopHandle,
  onBeforeUnmount,
  nextTick,
} from 'vue';
import type {
  Router,
  _RouteLocationBase,
  RouteLocationRaw,
  LocationQueryRaw,
  RouteLocationNormalizedLoaded,
  RouteRecordRaw,
} from 'vue-router';
import {
  isSameRoute,
  SameRouteCheckOptions,
  getRouteQuery,
  RouteQueryType,
  getQueryMergedLocation,
} from '@fastkit/vue-utils';
import { useTypedQuery, QueriesSchema, TypedQuery } from './composables';
import { locationIsMatched } from './utils';

type RawRouteComponent = NonNullable<RouteRecordRaw['component']>;

/**
 * The state of route transition
 */
export interface LocationTransitioning {
  /** The route path is in the process of transitioning */
  path?: boolean;
  /** The route query is in the process of transitioning */
  query: string[];
  /** The route's hash is in the process of transitioning */
  hash?: boolean;
}

/**
 * The state of the location service
 */
export interface LocationServiceState {
  /**
   * The route location object that will be the destination when the route is in the process of transitioning
   *
   * @see {@link _RouteLocationBase}
   */
  transitioningTo: _RouteLocationBase | null;
}

export interface LocationServiceContext {
  router: Router;
}

export interface WatchRouteOptions<Immediate = boolean>
  extends WatchOptions<Immediate> {
  /**
   * Automatically stop watching when the component is unmounted
   */
  autoStop?: boolean;
}

/**
 * Location Service
 *
 * A class for referencing and manipulating the state of vue-router.
 */
export class LocationService {
  /**
   * The state of the location service
   *
   * @see {@link LocationServiceState}
   */
  readonly state: LocationServiceState;

  /**
   * Router instance.
   *
   * @see {@link Router}
   */
  readonly router: Router;

  /**
   * The currently active route
   *
   * @see {@link Router.currentRoute}
   */
  get currentRoute() {
    return this.router.currentRoute.value;
  }

  /**
   * Watching route transitions
   *
   * @param cb - Callback function
   * @param options - Watch options
   * @returns Stop function for the watcher
   */
  watchRoute<Immediate extends Readonly<boolean> = false>(
    cb: WatchCallback<
      RouteLocationNormalizedLoaded,
      Immediate extends true
        ? RouteLocationNormalizedLoaded | undefined
        : RouteLocationNormalizedLoaded
    >,
    options?: WatchRouteOptions<Immediate>,
  ): WatchStopHandle {
    let stopped = false;
    let autoStop = options?.autoStop;
    if (autoStop == null) {
      autoStop = true;
    }

    const stopHandle = watch(
      this.router.currentRoute,
      (currentRoute, oldValue, onInvalidate) => {
        if (stopped) return;
        if (autoStop) {
          nextTick(() => {
            if (stopped) return;
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
        stopped = true;
        stopHandle();
      });
    }

    return stopHandle;
  }

  /**
   * The route location object that will be the destination when the route is in the process of transitioning
   *
   * @see {@link _RouteLocationBase}
   */
  get transitioningTo() {
    return this.state.transitioningTo;
  }

  /**
   * The state of route transition
   *
   * @see {@link LocationTransitioning}
   */
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

  /**
   * Checks whether the specified location matches the current route.
   *
   * @param target - The location to be checked for a match with the current route.
   * @returns Returns true if the specified location matches the current route, otherwise returns false.
   */
  locationIsMatched(target: RouteLocationRaw): boolean {
    return locationIsMatched(this.router, target);
  }

  /**
   * Check if the specified query is in the process of transitioning
   *
   * @param queries - The query name or a list of queries to check
   * @returns Returns `true` if it is in the process of transitioning
   */
  isQueryOnlyTransitioning(queries?: string | string[]): boolean {
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

  /**
   * Check if the specified route matches the current route
   *
   * @param raw - The route object to check
   * @param opts - {@link SameRouteCheckOptions Check Option}
   * @returns Returns `true` if it matches
   *
   * @see {@link isSameRoute}
   */
  match(raw?: RouteLocationRaw, opts?: SameRouteCheckOptions) {
    if (!raw) return false;
    const route = this.router.resolve(raw);
    return isSameRoute(this.currentRoute, route, opts);
  }

  /**
   * Retrieve an array of components that match the currently active route
   *
   * @returns An array of matching components
   */
  getMatchedComponents(): RawRouteComponent[];

  /**
   * Get an array of components that match the specified route
   *
   * @param raw - The route object from which to extract components
   * @returns An array of matching components
   */
  getMatchedComponents(raw: RouteLocationRaw): RawRouteComponent[];

  getMatchedComponents(raw?: RouteLocationRaw): RawRouteComponent[] {
    const route = raw
      ? this.router.resolve(raw)
      : this.router.currentRoute.value;
    return route.matched.flatMap((record) =>
      Object.values(record.components || {}),
    );
  }

  /**
   * Check if the current route is a valid route
   *
   * This checks if there are one or more matching components.
   */
  isAvailable(): boolean;

  /**
   * Check if the specified route object is a valid route
   * @param raw - The route object to check
   *
   * This checks if there are one or more matching components.
   */
  isAvailable(raw?: RouteLocationRaw): boolean;

  isAvailable(raw?: RouteLocationRaw): boolean {
    if (!raw) return false;
    return this.getMatchedComponents(raw).length > 0;
  }

  /**
   * Generate an interface for extracting and utility functions for query values corresponding to the specified schema:
   *
   * @param schema - Queries schema
   * @param router - router instance
   * @returns An interface for extracting query values corresponding to a schema and utility functions
   *
   * @see {@link QueriesSchema}
   * @see {@link TypedQuery}
   * @see {@link useTypedQuery}
   */
  useQuery<Schema extends QueriesSchema>(schema: Schema): TypedQuery<Schema> {
    return useTypedQuery(schema, this.router);
  }

  getQuery(key: string): string | undefined;

  getQuery(key: string, type: undefined, defaultValue: string): string;

  getQuery(key: string, type: StringConstructor): string | undefined;

  getQuery(key: string, type: StringConstructor, defaultValue: string): string;

  getQuery(key: string, type: NumberConstructor): number | undefined;

  getQuery(key: string, type: NumberConstructor, defaultValue: number): number;

  getQuery(key: string, type: BooleanConstructor): boolean;

  getQuery(
    key: string,
    type: BooleanConstructor,
    defaultValue: boolean,
  ): boolean;

  getQuery(
    key: string,
    // eslint-disable-next-line default-param-last
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
