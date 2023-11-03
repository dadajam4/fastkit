import { QueriesSchema } from './types';

/**
 * Define the schema of the queries map
 *
 * @example
 *
 * ```ts
 * const exampleSchema = defineQueriesSchema({
 *   // string: `string | undefined`
 *   string: String,
 *   // string with alias: `string | undefined`
 *   stringAlias: {
 *     aliasFor: 'string2',
 *     type: String,
 *   },
 *   // string with default: `string`
 *   stringWithDefault: {
 *     type: String,
 *     default: '',
 *   },
 *   // multiple string `string[]`
 *   stringMultiple: {
 *     type: String,
 *     multiple: true,
 *   },
 *   // number: `number | undefined`
 *   number: Number,
 *   // number with default: `number`
 *   numberWithDefault: {
 *     type: Number,
 *     default: 1,
 *   },
 *   // multiple number: `number[]`
 *   numberMultiple: {
 *     type: Number,
 *     multiple: true,
 *   },
 *   // boolean: `boolean`
 *   boolean: Boolean,
 *   // custom boolean `boolean`
 *   customBoolean: {
 *     type: Boolean,
 *     booleanSchema: '1/0',
 *   },
 *   // strict boolean `boolean`
 *   strictBoolean: {
 *     type: Boolean,
 *     booleanSchema: {
 *       nullToTrue: false,
 *     },
 *   },
 *   // boolean with default: `boolean`
 *   booleanWithDefault: {
 *     type: Boolean,
 *     default: true,
 *   },
 *   // string or number union: `string | number | undefined`
 *   stringOrNumber: [String, Number],
 *   // multiple string or number union: `(string | number)[]`
 *   stringOrNumberMultiple: {
 *     type: [String, Number],
 *     multiple: true,
 *   },
 *   // union: `"apple" | "banana" | 50 | undefined`
 *   union: ['apple', 'banana', 50] as const,
 *   // multiple union: `("apple" | "banana" | 50)[]`
 *   unionMultiple: {
 *     type: ['apple', 'banana', 50] as const,
 *     multiple: true,
 *   },
 * });
 * ```
 *
 * @param schema - schema of the queries map
 * @returns schema of the queries map
 *
 * @see {@link QueriesSchema}
 */
export function defineQueriesSchema<Schema extends QueriesSchema>(
  schema: Schema,
): Schema {
  return schema;
}
