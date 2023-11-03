import { extractMeta } from '@fastkit/ts-tiny-meta';

import {
  LocationService,
  QuerySchema,
  defineQueriesSchema,
  QueryValueExtractor,
  createQueryValueExtractor,
  QueriesExtractor,
  createQueriesExtractor,
  TypedQuery,
  useTypedQuery,
} from '../src';

export const LocationServiceMeta = extractMeta(LocationService);

export const QuerySchemaMeta = extractMeta<QuerySchema>();

export const defineQueriesSchemaMeta = extractMeta(defineQueriesSchema);

export const QueryValueExtractorMeta = extractMeta<QueryValueExtractor>();
export const createQueryValueExtractorMeta = extractMeta(
  createQueryValueExtractor,
);
export const QueriesExtractorMeta = extractMeta<QueriesExtractor>();
export const createQueriesExtractorMeta = extractMeta(createQueriesExtractor);
export const TypedQueryMeta = extractMeta<TypedQuery>();
export const useTypedQueryMeta = extractMeta(useTypedQuery);
