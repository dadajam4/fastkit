import type { LocationQueryValue } from 'vue-router';
import {
  QuerySchemaSpec,
  QuerySchema,
  QueriesSchema,
  BooleanQuerySchema,
  InferQueryType,
} from './types';
import {
  normalizeRawBooleanQuerySchema,
  normalizeType,
  normalizeQuerySchemaSpec,
  LocationQueryValueChunk,
} from './_internal';

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

type NullValue = null | undefined;

type ExtractorReturnValue<
  T = any,
  D extends T | NullValue = undefined,
  R extends boolean = false,
> = R extends true
  ? Exclude<T, undefined>
  : D extends undefined
  ? T
  : Exclude<T | D, undefined>;

/**
 * The state of the query extraction result
 *
 * - `found` Found a value
 * - `fallback-default` Fallback to the default value
 * - `missing` No value was found
 * - `validation-failed` Validation failed
 */
export type QueryExtractResultState =
  | 'found'
  | 'fallback-default'
  | 'missing'
  | 'validation-failed';

/**
 * The result of the query value extraction
 */
export interface QueryExtractorResult<
  T = any,
  D extends T | NullValue = undefined,
  R extends boolean = false,
> {
  /**
   * The state of the query extraction result
   *
   * @see {@link QueryExtractResultState}
   */
  state: QueryExtractResultState;
  /**
   * The query value from the extraction source, which is vue-router
   */
  source: LocationQueryValue | LocationQueryValue[] | undefined;
  /**
   * The validated query resource
   */
  validatedValues: LocationQueryValue | LocationQueryValue[] | undefined;
  /**
   * The list of matched query values
   */
  matchedValues: LocationQueryValue[];
  /**
   * The extracted value
   */
  value: ExtractorReturnValue<T, D, R>;
  /**
   * If a validation is specified in the schema, this refers to the exception thrown during the validation process
   */
  validationError?: unknown;
}

// D extends T | NullValue = undefined

/**
 * Query value extractor
 *
 * @param queryValues - Query values obtained from vue-router
 * @param defaultValue - Default value when the query cannot be detected
 * @param required - Throw an exception when it cannot be detected
 * @returns Extracted value
 */
export type QueryValueExtractor<
  Spec extends QuerySchemaSpec = QuerySchemaSpec,
  T = InferQueryType<Spec>,
> = (<D extends T | NullValue = undefined, R extends boolean = false>(
  queryValues: LocationQueryValue | LocationQueryValue[] | undefined,
  defaultValue?: D,
  required?: R,
) => QueryExtractorResult<T, D, R>) & {
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
  serialize(
    value: InferQueryType<Spec>,
  ): LocationQueryValue | LocationQueryValue[] | undefined;
};

const createMissingError = (queryName: string) =>
  new Error(
    `missing required query value${queryName ? ` "${queryName}"` : ''}.`,
  );

const extractDefaultValue = (source: unknown) =>
  typeof source === 'function' ? source() : source;

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
export function createQueryValueExtractor<Spec extends QuerySchemaSpec>(
  spec: Spec,
  queryName?: string,
): QueryValueExtractor<Spec> {
  const schema = normalizeQuerySchemaSpec(spec);

  const {
    type,
    default: baseDefaultValue,
    multiple,
    validator,
    aliasFor,
  } = schema;
  const resolvedQueryName = aliasFor || queryName || '';
  const booleanSchema = normalizeRawBooleanQuerySchema(schema.booleanSchema);
  const types = (Array.isArray(type) ? type : [type]).map(normalizeType);

  const validate = <
    T extends LocationQueryValue | LocationQueryValue[] | undefined,
  >(
    queryValues: T,
  ): T | undefined => {
    if (!validator) return queryValues;
    if (Array.isArray(queryValues)) {
      return queryValues.filter((value) => validator(value) !== false) as T;
    }
    return validator(queryValues) === false ? undefined : queryValues;
  };

  const prepareValues = <
    T extends LocationQueryValue | LocationQueryValue[] | undefined,
  >(
    queryValues: T,
  ): {
    source: LocationQueryValue | LocationQueryValue[] | undefined;
    validatedValues: LocationQueryValue | LocationQueryValue[] | undefined;
    validationError?: unknown;
  } => {
    const source = (
      Array.isArray(queryValues) ? [...queryValues] : queryValues
    ) as T;
    let validatedValues: LocationQueryValue | LocationQueryValue[] | undefined;
    let validationError: unknown;
    try {
      validatedValues = validate(queryValues);
    } catch (err) {
      validationError = err;
    }
    return {
      source,
      validatedValues,
      validationError,
    };
  };

  const extractValue = (queryValue: LocationQueryValue | undefined) => {
    // if (queryValue !== undefined && validator?.(queryValue) === false) {
    //   return;
    // }
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
      const prepared = prepareValues(queryValues);
      const matchedValues: LocationQueryValue[] = [];
      if (prepared.validationError) {
        return {
          state: 'validation-failed',
          ...prepared,
          value: undefined,
          matchedValues,
        };
      }

      const { validatedValues } = prepared;

      const extracted: any[] = [];
      const values = Array.isArray(validatedValues)
        ? validatedValues
        : [validatedValues];
      let isFound = false;
      for (const value of values) {
        const picked = extractValue(value);
        if (picked !== undefined) {
          extracted.push(picked);
          matchedValues.push(value!);
          isFound = true;
        }
      }
      const extractedDefault = isFound
        ? undefined
        : extractDefaultValue(defaultValue);

      if (!isFound) {
        if (required) {
          return {
            state: 'validation-failed',
            ...prepared,
            value: extracted,
            matchedValues,
            validationError: createMissingError(resolvedQueryName),
          };
        }
        return {
          state: 'fallback-default',
          ...prepared,
          value: extractedDefault || extracted,
          matchedValues,
        };
      }
      return {
        state: 'found',
        ...prepared,
        value: extracted,
        matchedValues,
      };
    }) as QueryValueExtractor;

    extractor.serialize = (value: any) => {
      if (!value) return;
      if (!Array.isArray(value)) {
        value = [value];
      }
      const values = serializeChunks(value);
      if (values.length) return values;
    };
  } else {
    extractor = ((queryValues, defaultValue = baseDefaultValue, required) => {
      const prepared = prepareValues(queryValues);
      const matchedValues: LocationQueryValue[] = [];
      if (prepared.validationError) {
        return {
          state: 'validation-failed',
          ...prepared,
          value: undefined,
          matchedValues,
        };
      }
      const { validatedValues } = prepared;
      const values = Array.isArray(validatedValues)
        ? validatedValues
        : [validatedValues];

      let picked: any;

      for (const value of values) {
        picked = extractValue(value);
        if (picked !== undefined) {
          matchedValues.push(value!);
          break;
        }
      }

      if (picked !== undefined) {
        return {
          state: 'found',
          ...prepared,
          value: picked,
          matchedValues,
        };
      }

      const extractedDefault = extractDefaultValue(defaultValue);

      if (extractedDefault !== undefined) {
        return {
          state: 'fallback-default',
          ...prepared,
          value: extractedDefault,
          matchedValues,
        };
      }

      if (required) {
        return {
          state: 'validation-failed',
          ...prepared,
          value: undefined,
          matchedValues,
          validationError: createMissingError(resolvedQueryName),
        };
      }

      return {
        state: 'missing',
        ...prepared,
        value: undefined,
        matchedValues,
      };
    }) as QueryValueExtractor;
    extractor.serialize = serializeChunk;
  }

  (extractor as any).queryName = resolvedQueryName;
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
  // I = ExtractQueryTypes<Schema>,
> = {
  [K in keyof Schema]-?: QueryValueExtractor<Schema[K]>;
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
