import { type ComputedRef, computed, type Ref, ref } from 'vue';
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
import { useLocationService, type LocationService } from '../../vue-location';

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
   * Location Service
   *
   * @see {@link LocationService}
   */
  get $service(): LocationService;

  /**
   * List of currently transitioning query names
   */
  get $transitioningQueries(): (keyof Schema)[];

  /**
   * Whether this query is currently transitioning
   */
  get $transitioning(): boolean;

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

  /**
   * Transitioning due to query submission
   */
  get $sending(): boolean;

  /**
   * Generate query form
   *
   * @param options - form options
   *
   * @see {@link TypedQueryFormSubmitOptions}
   * @see {@link TypedQueryForm}
   */
  $form(options?: TypedQueryFormSubmitOptions): TypedQueryForm<Schema>;
}

/**
 * Behavior of query form
 *
 * @see {@link Router.push}
 * @see {@link Router.replace}
 */
export type TypedQueryFormSubmitBehavior = 'push' | 'replace';

/**
 * Options for submit query form
 */
export interface TypedQueryFormSubmitOptions {
  /**
   * The destination route
   *
   * If not specified, the current route will be selected
   *
   * @see {@link RouteLocationRaw}
   */
  to?: RouteLocationRaw;
  /**
   * Behavior of query form
   *
   * @default "push"
   *
   * @see {@link TypedQueryFormSubmitBehavior}
   */
  behavior?: TypedQueryFormSubmitBehavior;
}

/**
 * Query form
 */
export interface TypedQueryForm<Schema extends QueriesSchema = QueriesSchema> {
  /**
   * Query object context
   *
   * @see {@link TypedQuery}
   */
  readonly ctx: TypedQuery<Schema>;
  /**
   * The destination route
   *
   * If not specified, the current route will be selected
   *
   * @see {@link RouteLocationRaw}
   */
  readonly to?: RouteLocationRaw;
  /**
   * Behavior of query form
   *
   * @see {@link TypedQueryFormSubmitBehavior}
   */
  readonly behavior: TypedQueryFormSubmitBehavior;
  /**
   * Current query value
   */
  readonly query: Readonly<ExtractQueryTypes<Schema>>;
  /**
   * Current form value
   */
  readonly values: ExtractQueryTypes<Schema>;
  /**
   * List of fields that have changed relative to the current query value
   */
  readonly changes: (keyof Schema)[];
  /**
   * Whether one or more fields have changed relative to the current query value
   */
  readonly hasChanged: boolean;

  /**
   * List of currently transitioning query names
   */
  get transitioningQueries(): (keyof Schema)[];

  /**
   * Whether this query is currently transitioning
   */
  get transitioning(): boolean;

  /**
   * Transitioning due to query submission
   */
  get sending(): boolean;

  /**
   * Reset form values to the current query value
   */
  reset(): void;
  /**
   * Submit form values and navigate to the route
   *
   * @param options - Options for submit query form
   *
   * @see {@link TypedQueryFormSubmitOptions}
   */
  submit(options?: TypedQueryFormSubmitOptions): ReturnType<Router['push']>;
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

const unwrapArray = <T>(v: T): T => (Array.isArray(v) ? (v.slice() as T) : v);

const ownPropertyDescriptor = {
  enumerable: true,
  configurable: true,
};

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
  const service = useLocationService();
  const sending = ref(false);
  const keys = Object.keys(schema);
  const extractors = createQueriesExtractor<AnySchema>(schema as any);
  const { currentRoute } = router;
  const getQuery = (queryName: string) => currentRoute.value.query[queryName];
  const states = {} as Record<string, ComputedRef<QueryExtractorResult>>;

  const $states = new Proxy(states, {
    get: (_target, p) => states[p as string].value,
    getOwnPropertyDescriptor() {
      return ownPropertyDescriptor;
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

  const transitioningQueries = computed(() => {
    const queries = service.transitioning?.query;
    if (!queries || !queries.length) return [];
    return keys.filter((key) => queries.includes(key));
  });

  const getters = {} as Record<string, any>;
  const api = {
    get $service() {
      return service;
    },
    get $transitioningQueries() {
      return transitioningQueries.value;
    },
    get $transitioning() {
      return transitioningQueries.value.length > 0;
    },
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
    get $sending() {
      return sending.value;
    },
  } as unknown as TypedQuery<AnySchema>;

  const proxy = new Proxy(getters as unknown as TypedQuery<AnySchema>, {
    get: (_target, p) => {
      if (Reflect.has(api, p)) return Reflect.get(api, p);
      return states[p as string]?.value.value;
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
    ownKeys() {
      return keys.filter((key) => states[key]?.value.value !== undefined);
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
    let targetQuery = targetRoute.query;
    const merge = options?.merge ?? false;
    if (merge) {
      const current = router.currentRoute.value;
      if (current.path === router.resolve(targetRoute).path) {
        targetQuery = current.query;
      }
    }
    const serialized = proxy.$serialize(values);
    const query = merge ? { ...targetQuery, ...serialized } : serialized;
    for (const [key, v] of Object.entries(values)) {
      if (v === null || (Array.isArray(v) && v.length === 0)) delete query[key];
    }
    return router.resolve({ ...targetRoute, query });
  };

  api.$push = (values, options) => {
    sending.value = true;
    return router.push(proxy.$location(values, options)).finally(() => {
      sending.value = false;
    });
  };
  api.$replace = (values, options) => {
    sending.value = true;
    return router.replace(proxy.$location(values, options)).finally(() => {
      sending.value = false;
    });
  };

  api.$form = (options) => {
    const to = computed(() => options?.to || router.currentRoute.value);
    const behavior = computed(() => options?.behavior || 'push');
    const _query = new Proxy({} as Readonly<ExtractQueryTypes<AnySchema>>, {
      get: (_target, p) => {
        if (keys.includes(p as any)) return Reflect.get(proxy, p);
      },
      getOwnPropertyDescriptor() {
        return ownPropertyDescriptor;
      },
      ownKeys() {
        return keys;
      },
    });
    const _values: Record<
      keyof any,
      {
        value: Ref<any>;
        changed: ComputedRef<boolean>;
      }
    > = {};

    for (const key of keys) {
      const currentValue = unwrapArray(_query[key]);
      const value = ref(currentValue);
      _values[key] = {
        value,
        changed: computed(() => {
          const queryValue = (_query as any)[key];
          const _currentValue = value.value;
          if (Array.isArray(queryValue)) {
            if (!Array.isArray(_currentValue)) {
              return true;
            }
            const { length } = queryValue;
            if (length !== _currentValue.length) {
              return true;
            }
            for (let i = 0; i < length; i++) {
              if (queryValue[i] !== _currentValue[i]) {
                return true;
              }
            }
            return false;
          }
          return queryValue !== _currentValue;
        }),
      };
    }

    const reset = () => {
      for (const key of keys) {
        const _ref = _values[key];
        _ref.value.value = unwrapArray(_query[key]);
      }
    };

    const values = new Proxy({} as ExtractQueryTypes<AnySchema>, {
      get: (_target, p) => {
        if (keys.includes(p as any)) return _values[p].value.value;
      },
      set(_target, p, newValue) {
        if (keys.includes(p as any)) {
          _values[p].value.value = newValue;
          return true;
        }
        return false;
      },
      getOwnPropertyDescriptor() {
        return ownPropertyDescriptor;
      },
      ownKeys() {
        return keys;
      },
    });
    const changes = computed(() =>
      keys.filter((key) => _values[key].changed.value),
    );
    const submit: TypedQueryForm<AnySchema>['submit'] = (opts) => {
      const _to = opts?.to || to.value;
      const _behavior = opts?.behavior || behavior.value;
      const __values: Record<keyof any, any> = {};
      for (const key of keys) {
        const current = _values[key];
        if (current.changed.value) {
          let _value = unwrapArray(current.value.value);
          if (Array.isArray(_value) && _value.length === 0) {
            _value = null;
          } else if (_value === '') {
            _value = null;
          }
          __values[key] = _value;
        }
      }
      return api[`$${_behavior}`](__values, { merge: true, to: _to });
    };

    const form: TypedQueryForm<AnySchema> = {
      get ctx() {
        return proxy as TypedQuery<AnySchema>;
      },
      get to() {
        return to.value;
      },
      get behavior() {
        return behavior.value;
      },
      get query() {
        return _query;
      },
      get values() {
        return values;
      },
      get changes() {
        return changes.value;
      },
      get hasChanged() {
        return changes.value.length > 0;
      },
      get transitioningQueries() {
        return api.$transitioningQueries;
      },
      get transitioning() {
        return api.$transitioning;
      },
      get sending() {
        return sending.value;
      },
      reset,
      submit,
    };
    return form;
  };

  return proxy as TypedQuery<Schema>;
}
