import type { LocationQueryValue } from 'vue-router';
import {
  QuerySchemaSpec,
  QuerySchema,
  QueriesSchema,
  ExtractQueryTypes,
  BooleanQuerySchema,
} from './types';
import { normalizeRawBooleanQuerySchema } from './_internal';

type LocationQueryValueChunk = string | null | undefined;

function stringExtractor(
  queryValue: LocationQueryValueChunk,
): string | undefined {
  return queryValue || undefined;
}

function numberExtractor(
  queryValue: LocationQueryValueChunk,
): number | undefined {
  if (!queryValue || isNaN(queryValue as unknown as number)) return undefined;
  return Number(queryValue);
}

const FALSE_LIKE_RE = /^(0|false)$/i;
const TRUE_LIKE_RE = /^(1|true)$/i;

function booleanExtractor(
  queryValue: LocationQueryValueChunk,
  schema?: BooleanQuerySchema,
): boolean | undefined {
  const values = schema?.values;
  const nullToTrue = schema?.nullToTrue;

  if ((queryValue === null && nullToTrue) || nullToTrue === undefined)
    return true;

  if (queryValue) {
    if (values) {
      if (values[0] === queryValue) return true;
      if (values[1] === queryValue) return false;
      return;
    }
    if (FALSE_LIKE_RE.test(queryValue)) return false;
    if (TRUE_LIKE_RE.test(queryValue)) return true;
  }

  return;
}

function typedExtractor<T>(
  queryValue: LocationQueryValueChunk,
  type: T,
): T | undefined {
  let extracted: any = queryValue;
  if (typeof type === 'number') {
    extracted = numberExtractor(queryValue);
  } else if (typeof type === 'boolean') {
    extracted = booleanExtractor(queryValue);
  }
  if (extracted === type) return extracted;
}

type ExtractorReturnValue<
  T = any,
  D = T,
  R extends boolean = false,
> = R extends true ? Exclude<T | D, undefined> : T | D;

/**
 * Query value extractor
 *
 * @param queryValues - Query values obtained from vue-router
 * @param defaultValue - Default value when the query cannot be detected
 * @param required - Throw an exception when it cannot be detected
 * @returns Extracted value
 */
export type QueryValueExtractor<T = any, D = T, R extends boolean = false> = ((
  queryValues: LocationQueryValue | LocationQueryValue[] | undefined,
  defaultValue?: D,
  required?: R,
) => ExtractorReturnValue<T, D, R>) & {
  /** Query name */
  get queryName(): string;
  /**
   * Query schema
   *
   * @see {@link QuerySchema}
   */
  get schema(): QuerySchema;
  /**
   * Serialize the specified value into a format that can be handled by vue-router
   * @param value - Value to serialize
   * @returns Serialized value
   */
  serialize(value: T): LocationQueryValue | LocationQueryValue[] | undefined;
};

const normalizeType = (type: any) =>
  type == null || type === true ? String : type;

const normalizeQuerySchemaSpec = (
  spec: QuerySchemaSpec | null | true,
): QuerySchema => {
  spec = normalizeType(spec);
  const result = {
    ...(typeof spec === 'object' && !Array.isArray(spec)
      ? (spec as QuerySchema)
      : { type: spec }),
  };
  if (result.type === Boolean && result.default === undefined) {
    result.default = false;
  }
  return result;
};

/**
 * Generate a query value extractor
 *
 * @param spec - Query schema specification
 * @param queryName - Query name
 * @returns Query value extractor
 *
 * @see {@link QuerySchemaSpec}
 * @see {@link QueryValueExtractor}
 */
export function createQueryValueExtractor(
  spec: QuerySchemaSpec | null | true,
  queryName?: string,
): QueryValueExtractor {
  const schema = normalizeQuerySchemaSpec(spec);

  const {
    type,
    default: baseDefaultValue,
    multiple,
    validator,
    aliasFor,
  } = schema;
  const resolvedQueryName = aliasFor || queryName;
  const booleanSchema = normalizeRawBooleanQuerySchema(schema.booleanSchema);
  const types = (Array.isArray(type) ? type : [type]).map(normalizeType);
  const extractValue = (queryValue: LocationQueryValue | undefined) => {
    if (queryValue !== undefined && validator?.(queryValue) === false) {
      return;
    }
    for (const type of types) {
      let extracted: any;
      if (type === String) {
        extracted = stringExtractor(queryValue);
      } else if (type === Number) {
        extracted = numberExtractor(queryValue);
      } else if (type === Boolean) {
        extracted = booleanExtractor(queryValue, booleanSchema);
      } else {
        extracted = typedExtractor(queryValue, type);
      }
      if (extracted !== undefined) {
        return extracted;
      }
    }
  };

  let extractor: QueryValueExtractor;

  const serializeChunk = (chunk: unknown): LocationQueryValue | undefined => {
    if (typeof chunk === 'string') return chunk;
    if (typeof chunk === 'number') return String(chunk);
    if (typeof chunk === 'boolean') {
      return chunk ? booleanSchema.values[0] : booleanSchema.values[1];
    }
  };

  const serializeChunks = (chunks: unknown[]): LocationQueryValue[] => {
    const values: LocationQueryValue[] = [];
    for (const chunk of chunks) {
      const value = serializeChunk(chunk);
      value !== undefined && values.push(value);
    }
    return values;
  };

  if (multiple) {
    extractor = ((queryValues, defaultValue = baseDefaultValue, required) => {
      const extracted: any[] = [];
      const values = Array.isArray(queryValues) ? queryValues : [queryValues];
      let isFound = false;
      for (const value of values) {
        const picked = extractValue(value);
        if (picked !== undefined) {
          extracted.push(picked);
          isFound = true;
        }
      }
      if (!isFound && defaultValue) return defaultValue;
      return extracted;
    }) as QueryValueExtractor;

    extractor.serialize = (value) => {
      if (!value) return;
      if (!Array.isArray(value)) {
        value = [value];
      }
      const values = serializeChunks(value);
      if (values.length) return values;
    };
  } else {
    extractor = ((queryValues, defaultValue = baseDefaultValue, required) => {
      const value = Array.isArray(queryValues) ? queryValues[0] : queryValues;
      const picked = extractValue(value);
      if (picked !== undefined) return picked;
      if (defaultValue !== undefined) return defaultValue;
      if (required) {
        throw new Error(
          `missing required query value${
            queryName ? ` "${resolvedQueryName}"` : ''
          }.`,
        );
      }
    }) as QueryValueExtractor;
    extractor.serialize = serializeChunk;
  }

  (extractor as any).queryName = resolvedQueryName || '';
  (extractor as any).schema = schema;

  return extractor;
}

/**
 * Interface for query value extractors corresponding to a schema.
 *
 * @see {@link QueriesSchema}
 * @see {@link QueryValueExtractor}
 */
export type QueriesExtractor<
  Schema extends QueriesSchema = QueriesSchema,
  I = ExtractQueryTypes<Schema>,
> = {
  [K in keyof I]-?: QueryValueExtractor<I[K], any, boolean>;
};

/**
 * Generate an interface for query value extractors corresponding to a schema
 *
 * @param schema - Queries schema
 * @returns Interface for query value extractors corresponding to a schema.
 *
 * @see {@link QueriesSchema}
 * @see {@link QueriesExtractor}
 */
export function createQueriesExtractor<Schema extends QueriesSchema>(
  schema: Schema,
): QueriesExtractor<Schema> {
  const obj: any = {};
  const keys = Object.keys(schema);
  const proxy = new Proxy(obj, {
    get(_target, p) {
      const spec = (schema as any)[p];
      if (spec === undefined) return;
      let extractor = obj[p];
      if (!extractor) {
        extractor = createQueryValueExtractor(spec, p as any);
        obj[p] = extractor;
      }
      return extractor;
    },
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
  return proxy;
}
