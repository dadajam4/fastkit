import { describe, it, expect } from 'vitest';
import { createQueriesExtractor } from '../extractor';
import { defineQueriesSchema } from '../helpers';

describe('defineQueriesSchema', () => {
  function createSchema() {
    return defineQueriesSchema({
      // string: `string | undefined`
      string: String,
      // string with default: `string`
      stringWithDefault: {
        type: String,
        default: '',
      },
      // multiple string `string[]`
      stringMultiple: {
        type: String,
        multiple: true,
      },
      // number: `number | undefined`
      number: Number,
      // number with default: `number`
      numberWithDefault: {
        type: Number,
        default: 1,
      },
      // multiple number: `number[]`
      numberMultiple: {
        type: Number,
        multiple: true,
      },
      // boolean: `boolean`
      boolean: Boolean,
      // boolean with default: `boolean`
      booleanWithDefault: {
        type: Boolean,
        default: true,
      },
      // string or number union: `string | number | undefined`
      stringOrNumber: [String, Number],
      // multiple string or number union: `(string | number)[]`
      stringOrNumberMultiple: {
        type: [String, Number],
        multiple: true,
      },
      // union: `"apple" | "banana" | 50 | undefined`
      union: ['apple', 'banana', 50] as const,
      // multiple union: `("apple" | "banana" | 50)[]`
      unionMultiple: {
        type: ['apple', 'banana', 50] as const,
        multiple: true,
      },
    });
  }

  it('construct', () => {
    const schema = createSchema();
    const extractor = createQueriesExtractor(schema);

    expect(Object.keys(extractor)).toStrictEqual(Object.keys(schema));
    expect(extractor.string.schema).toMatchObject({ type: String });
    expect(extractor.number.schema).toMatchObject({ type: Number });
  });

  it('extract', () => {
    const schema = createSchema();
    const extractor = createQueriesExtractor(schema);
    expect(extractor.unionMultiple(['50', '2', 'apple'])).toMatchObject([
      50,
      'apple',
    ]);
  });
});
