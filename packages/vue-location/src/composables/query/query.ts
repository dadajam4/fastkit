import { ComputedRef, computed } from 'vue';
import {
  useRouter,
  type LocationQuery,
  type Router,
  type RouteLocationRaw,
} from 'vue-router';
import {
  QueriesSchema,
  ExtractQueryTypes,
  ExtractQueryInputs,
  InferQueryType,
} from './types';
import {
  createQueriesExtractor,
  QueryExtractorResult,
  QueriesExtractor,
} from './extractor';

/**
 * Route generation options
 */
export interface TypedQueryRouteOptions {
  /**
   * Overwrite only the specified query while preserving the existing ones
   *
   * @default false
   */
  merge?: boolean;
  /**
   * The destination route
   *
   * If not specified, the current route will be selected
   *
   * @see {@link RouteLocationRaw}
   */
  to?: RouteLocationRaw;
}

/**
 * The extraction results of all the latest queries.
 *
 * @see {@link QueryExtractorResult}
 */
export type TypedQueryExtractStates<
  Schema extends QueriesSchema = QueriesSchema,
> = {
  [K in keyof Schema]-?: QueryExtractorResult<InferQueryType<Schema[K]>>;
};

/**
 * An interface for referencing and manipulating queries in a schema-safe manner
 */
export interface TypedQueryInterface<
  Schema extends QueriesSchema = QueriesSchema,
> {
  /**
   * Router instance
   *
   * @see {@link Router}
   */
  get $router(): Router;

  /**
   * Current route
   *
   * @see {@link Router.currentRoute}
   */
  get $currentRoute(): Router['currentRoute']['value'];
  /**
   * Interface for query value extractors corresponding to a schema.
   *
   * @see {@link QueriesExtractor}
   */
  get $extractors(): QueriesExtractor<Schema>;
  /**
   * The extraction results of all the latest queries.
   *
   * @see {@link TypedQueryExtractStates}
   */
  get $states(): TypedQueryExtractStates<Schema>;
  /**
   * Retrieve the current value corresponding to the specified query name and throw an exception if it doesn't exist.
   * @param queryKey - Query name
   */
  $ensure<K extends keyof Schema>(
    queryKey: K,
  ): Exclude<InferQueryType<Schema[K]>, undefined>;
  /**
   * Obtain a query object that serializes all the current values for handling in vue-router.
   */
  $serializeCurrentValues(): LocationQuery;
  /**
   * Serialize the specified value into a query object that can be handled by vue-router.
   * @param values - Value to serialize
   */
  $serialize(values: ExtractQueryInputs<Schema>): LocationQuery;
  /**
   * Serialize the specified value into a query object that can be handled by vue-router.
   * @param values - Value to serialize
   * @param mergeCurrentValues - Merge with the current values
   */
  $serialize(
    values: ExtractQueryInputs<Schema>,
    mergeCurrentValues: false,
  ): LocationQuery;
  /**
   * Merge the specified values with all the current values and obtain a serialized object for handling in vue-router.
   * @param values - Value to merge
   * @param mergeCurrentValues - Merge with the current values
   */
  $serialize(
    values: ExtractQueryInputs<Schema>,
    mergeCurrentValues: true,
  ): LocationQuery;
  /**
   * Get the vue-router location object corresponding to the specified value
   * @param values - Value to query
   * @param options - Route generation options
   *
   * @see {@link TypedQueryRouteOptions}
   */
  $location(
    values: ExtractQueryInputs<Schema>,
    options?: TypedQueryRouteOptions,
  ): ReturnType<Router['resolve']>;
  /**
   * Set the specified value as a query and navigate to the route by executing vue-router's `push` method
   * @param values - Value to query
   * @param options - Route generation options
   *
   * @see {@link Router.push}
   */
  $push(
    values: ExtractQueryInputs<Schema>,
    options?: TypedQueryRouteOptions,
  ): ReturnType<Router['push']>;
  /**
   * Set the specified value as a query and navigate to the route by executing vue-router's `replace` method
   * @param values - Value to query
   * @param options - Route generation options
   *
   * @see {@link Router.replace}
   */
  $replace(
    values: ExtractQueryInputs<Schema>,
    options?: TypedQueryRouteOptions,
  ): ReturnType<Router['replace']>;
}

/**
 * A query object corresponding to a schema and a custom interface for referencing and manipulating queries
 *
 * @see {@link QueriesSchema}
 * @see {@link TypedQueryInterface}
 */
export type TypedQuery<Schema extends QueriesSchema = QueriesSchema> = Readonly<
  ExtractQueryTypes<Schema>
> &
  TypedQueryInterface<Schema>;

type AnySchema = Record<string, true>;

/**
 * Generate an interface for extracting and utility functions for query values corresponding to the specified schema:
 *
 * @param schema - Queries schema
 * @param router - router instance
 * @returns An interface for extracting query values corresponding to a schema and utility functions
 *
 * @see {@link QueriesSchema}
 * @see {@link TypedQuery}
 */
export function useTypedQuery<Schema extends QueriesSchema>(
  schema: Schema,
  router = useRouter(),
): TypedQuery<Schema> {
  const keys = Object.keys(schema);
  const extractors = createQueriesExtractor<AnySchema>(schema as any);
  const { currentRoute } = router;
  const getQuery = (queryName: string) => currentRoute.value.query[queryName];
  const states = {} as Record<string, ComputedRef<QueryExtractorResult>>;

  const $states = new Proxy(states, {
    get: (_target, p) => states[p as string].value,
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
    ownKeys() {
      return keys;
    },
  });

  for (const [queryName, extractor] of Object.entries(extractors)) {
    states[queryName] = computed(() =>
      extractor(getQuery(extractor.queryName)),
    );
  }

  const getters = {} as Record<string, any>;
  const api = {
    get $router() {
      return router;
    },
    get $currentRoute() {
      return router.currentRoute.value;
    },
    get $extractors() {
      return extractors;
    },
    get $states() {
      return $states;
    },
  } as unknown as TypedQuery<AnySchema>;

  const proxy = new Proxy(getters as unknown as TypedQuery<AnySchema>, {
    get: (_target, p) => {
      if (Reflect.has(api, p)) return Reflect.get(api, p);
      return states[p as string].value.value;
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
    ownKeys() {
      return keys.filter((key) => states[key].value.value !== undefined);
    },
  });

  api.$ensure = (queryKey) => {
    const extractor = extractors[queryKey];
    const { value, validationError } = extractor(
      getQuery(extractor.queryName),
      undefined,
      true,
    );
    if (value === undefined) {
      const err =
        validationError ||
        new Error(`missing required query value "${extractor.queryName}".`);
      throw err;
    }
    return value;
  };

  api.$serialize = ((
    values: Record<string, any>,
    mergeCurrentValues,
  ): LocationQuery => {
    const queries: LocationQuery = {};
    const fromValues = mergeCurrentValues
      ? { ...proxy, ...values }
      : values || { ...proxy };
    for (const [key, value] of Object.entries(fromValues)) {
      const extractor = extractors[key];
      const serialized = extractor.serialize(value);
      if (serialized !== undefined) {
        queries[extractor.queryName] = serialized;
      }
    }
    return queries;
  }) as TypedQuery<Schema>['$serialize'];

  api.$serializeCurrentValues = () => api.$serialize({}, true);

  const normalizeRouteLocation = (raw: RouteLocationRaw | undefined) => {
    if (!raw) {
      const current = router.currentRoute.value;
      return {
        path: current.path,
        query: current.query,
        hash: current.hash,
      };
    }
    return typeof raw === 'string' ? router.resolve(raw) : raw;
  };

  api.$location = (values, options) => {
    const targetRoute = normalizeRouteLocation(options?.to);
    const serialized = proxy.$serialize(values);
    const query = options?.merge
      ? { ...targetRoute.query, ...serialized }
      : serialized;
    return router.resolve({ ...targetRoute, query });
  };

  api.$push = (values, options) =>
    router.push(proxy.$location(values, options));
  api.$replace = (values, options) =>
    router.replace(proxy.$location(values, options));

  return proxy as TypedQuery<Schema>;
}
