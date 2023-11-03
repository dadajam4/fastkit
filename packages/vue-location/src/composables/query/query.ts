import { ComputedRef, computed } from 'vue';
import {
  QueriesSchema,
  ExtractQueryTypes,
  ExtractQueryInputs,
  InferQueryType,
} from './types';
import { createQueriesExtractor, QueryValueExtractor } from './extractor';
import { useRouter, type LocationQuery, type Router } from 'vue-router';

/**
 * An interface for extracting query values corresponding to a schema and utility functions
 *
 * @see {@link QueriesSchema}
 */
export type TypedQuery<Schema extends QueriesSchema = QueriesSchema> =
  ExtractQueryTypes<Schema> & {
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
    $serialize(): LocationQuery;
    /**
     * Retrieve an object that serializes values corresponding to the schema for handling in vue-router.
     * @param values - Value to serialize
     */
    $serialize(values: ExtractQueryInputs<Schema>): LocationQuery;
    /**
     * Retrieve an object that serializes values corresponding to the schema for handling in vue-router.
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
     * Obtain a vue-router location object with the specified values merged into the current root query.
     * @param values - Value to merge
     */
    $location(
      values: ExtractQueryInputs<Schema>,
    ): ReturnType<Router['resolve']>;
    /**
     * Merge the specified values with the current values and execute the `push` method of vue-router.
     * @param values - Value to merge
     */
    $push(values: ExtractQueryInputs<Schema>): ReturnType<Router['push']>;
    /**
     * Merge the specified values with the current values and execute the `replace` method of vue-router.
     * @param values - Value to merge
     */
    $replace(values: ExtractQueryInputs<Schema>): ReturnType<Router['push']>;
  };

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
  const refs = {} as Record<string, ComputedRef>;
  for (const [queryName, extractor] of Object.entries<QueryValueExtractor>(
    extractors,
  )) {
    refs[queryName] = computed(() => extractor(getQuery(extractor.queryName)));
  }

  const getters = {} as Record<string, any>;
  const api = {} as TypedQuery<AnySchema>;

  const proxy = new Proxy(getters as unknown as TypedQuery<AnySchema>, {
    get: (_target, p) => {
      if (Reflect.has(api, p)) return Reflect.get(api, p);
      return refs[p as string].value;
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
    ownKeys() {
      return keys.filter((key) => refs[key].value !== undefined);
    },
  });

  api.$ensure = (queryKey) => {
    const extractor = extractors[queryKey];
    return extractor(getQuery(extractor.queryName), undefined, true);
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

  api.$location = (values) => {
    const { path } = router.currentRoute.value;
    const query = proxy.$serialize(values, true);
    return router.resolve({ path, query });
  };

  api.$push = (values) => router.push(proxy.$location(values));
  api.$replace = (values) => router.replace(proxy.$location(values));

  return proxy as TypedQuery<Schema>;
}
