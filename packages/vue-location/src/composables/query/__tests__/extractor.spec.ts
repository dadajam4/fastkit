import { describe, it, expect } from 'vitest';
import {
  createQueryValueExtractor,
  createQueriesExtractor,
} from '../extractor';

describe('createQueryValueExtractor', () => {
  it('construct', () => {
    const extractor = createQueryValueExtractor(String);
    expect(extractor).toBeTypeOf('function');
    expect(extractor.schema).toMatchObject({ type: String });
    expect(extractor.queryName).toBe('');
  });

  describe('string', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor(String);
      expect(extractor(undefined)).toMatchObject({
        state: 'missing',
        source: undefined,
        validatedValues: undefined,
        validationError: undefined,
        value: undefined,
        matchedValues: [],
      });
      expect(extractor(null)).toMatchObject({
        state: 'missing',
        source: null,
        validatedValues: null,
        validationError: undefined,
        value: undefined,
        matchedValues: [],
      });
      expect(extractor('')).toMatchObject({
        state: 'missing',
        source: '',
        validatedValues: '',
        validationError: undefined,
        value: undefined,
        matchedValues: [],
      });
      expect(extractor('a')).toMatchObject({
        state: 'found',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: 'a',
        matchedValues: ['a'],
      });
      expect(extractor('1').value).toBe('1');
      expect(extractor([null, '', 'a', '1'])).toMatchObject({
        state: 'found',
        source: [null, '', 'a', '1'],
        validatedValues: [null, '', 'a', '1'],
        validationError: undefined,
        value: 'a',
        matchedValues: ['a'],
      });
      expect(extractor(['a', null, '', '1']).value).toBe('a');
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: String,
        default: '',
      });
      expect(extractor(undefined)).toMatchObject({
        state: 'fallback-default',
        source: undefined,
        validatedValues: undefined,
        validationError: undefined,
        value: '',
        matchedValues: [],
      });
      expect(extractor(null).value).toBe('');
      expect(extractor('').value).toBe('');
      expect(extractor('a')).toMatchObject({
        state: 'found',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: 'a',
        matchedValues: ['a'],
      });
      expect(extractor('1').value).toBe('1');
      expect(extractor([null, '', 'a', '1']).value).toBe('a');
      expect(extractor(['a', null, '', '1']).value).toBe('a');
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: String,
        multiple: true,
      });
      expect(extractor(undefined)).toMatchObject({
        state: 'fallback-default',
        source: undefined,
        validatedValues: undefined,
        validationError: undefined,
        value: [],
        matchedValues: [],
      });
      expect(extractor(null)).toMatchObject({
        state: 'fallback-default',
        source: null,
        validatedValues: null,
        validationError: undefined,
        value: [],
        matchedValues: [],
      });
      expect(extractor('')).toMatchObject({
        state: 'fallback-default',
        source: '',
        validatedValues: '',
        validationError: undefined,
        value: [],
        matchedValues: [],
      });
      expect(extractor('a')).toMatchObject({
        state: 'found',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: ['a'],
        matchedValues: ['a'],
      });
      expect(extractor('1').value).toStrictEqual(['1']);
      expect(extractor([null, '', 'a', '1'])).toMatchObject({
        state: 'found',
        source: [null, '', 'a', '1'],
        validatedValues: [null, '', 'a', '1'],
        validationError: undefined,
        value: ['a', '1'],
        matchedValues: ['a', '1'],
      });
      expect(extractor(['a', null, '', '1']).value).toStrictEqual(['a', '1']);
    });
  });

  describe('number', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor(Number);
      expect(extractor(undefined).value).toBeUndefined();
      expect(extractor(null).value).toBeUndefined();
      expect(extractor('').value).toBeUndefined();
      expect(extractor('a')).toMatchObject({
        state: 'missing',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: undefined,
        matchedValues: [],
      });
      expect(extractor('0')).toMatchObject({
        state: 'found',
        source: '0',
        validatedValues: '0',
        validationError: undefined,
        value: 0,
        matchedValues: ['0'],
      });
      expect(extractor('1').value).toBe(1);
      expect(extractor([null, '', 'a', '1']).value).toBe(1);
      expect(extractor(['1', 'a', null, '']).value).toBe(1);
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: Number,
        default: 10,
      });
      expect(extractor(undefined).value).toBe(10);
      expect(extractor(null).value).toBe(10);
      expect(extractor('').value).toBe(10);
      expect(extractor('a')).toMatchObject({
        state: 'fallback-default',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: 10,
        matchedValues: [],
      });
      expect(extractor('1').value).toBe(1);
      expect(extractor([null, '', 'a', 'b']).value).toBe(10);
      expect(extractor([null, '', 'a', '1']).value).toBe(1);
      expect(extractor(['1', 'a', null, '']).value).toBe(1);
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: Number,
        multiple: true,
      });
      expect(extractor(undefined).value).toStrictEqual([]);
      expect(extractor(null).value).toStrictEqual([]);
      expect(extractor('').value).toStrictEqual([]);
      expect(extractor('a').value).toStrictEqual([]);
      expect(extractor('10').value).toStrictEqual([10]);
      expect(extractor([null, '', '0', '1', 'a', '10']).value).toStrictEqual([
        0, 1, 10,
      ]);
      expect(extractor(['10', 'a', '1', null, '0', '']).value).toStrictEqual([
        10, 1, 0,
      ]);
    });
  });

  describe('boolean', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor(Boolean);
      expect(extractor(undefined).value).toBe(false);
      expect(extractor(null).value).toBe(true);
      expect(extractor('').value).toBe(false);
      expect(extractor('a')).toMatchObject({
        state: 'fallback-default',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: false,
        matchedValues: [],
      });
      expect(extractor('true')).toMatchObject({
        state: 'found',
        source: 'true',
        validatedValues: 'true',
        validationError: undefined,
        value: true,
        matchedValues: ['true'],
      });
      expect(extractor('false').value).toBe(false);
      expect(extractor('1').value).toBe(false);
      expect(extractor('0').value).toBe(false);
      expect(extractor(['', 'a', 'b']).value).toBe(false);
      expect(extractor(['', null, 'a', '1']).value).toBe(true);
      expect(extractor([null, '', 'a', '1']).value).toBe(true);
      expect(extractor(['true', null, 'a', '1']).value).toBe(true);
      expect(extractor([null, 'false', 'a', '1']).value).toBe(true);
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: Boolean,
        default: true,
      });
      expect(extractor(undefined).value).toBe(true);
      expect(extractor(null).value).toBe(true);
      expect(extractor('').value).toBe(true);
      expect(extractor('a').value).toBe(true);
      expect(extractor('true').value).toBe(true);
      expect(extractor('false').value).toBe(false);
      expect(extractor('1').value).toBe(true);
      expect(extractor('0').value).toBe(true);
      expect(extractor(['', null, 'a', '1']).value).toBe(true);
      expect(extractor([null, '', 'a', '1']).value).toBe(true);
      expect(extractor(['false', null, 'a', '1']).value).toBe(false);
      expect(extractor([null, 'false', 'a', '1']).value).toBe(true);
    });
  });

  describe('number -> string union', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor([Number, String]);
      expect(extractor(undefined).value).toBeUndefined();
      expect(extractor(null).value).toBeUndefined();
      expect(extractor('')).toMatchObject({
        state: 'missing',
        source: '',
        validatedValues: '',
        validationError: undefined,
        value: undefined,
        matchedValues: [],
      });
      expect(extractor('a')).toMatchObject({
        state: 'found',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: 'a',
        matchedValues: ['a'],
      });
      expect(extractor('1').value).toBe(1);
      expect(extractor([null, '', 'a', '1'])).toMatchObject({
        state: 'found',
        source: [null, '', 'a', '1'],
        validatedValues: [null, '', 'a', '1'],
        validationError: undefined,
        value: 'a',
        matchedValues: ['a'],
      });
      expect(extractor(['a', null, '', '1']).value).toBe('a');
      expect(extractor(['0', null, '', 'a'])).toMatchObject({
        state: 'found',
        source: ['0', null, '', 'a'],
        validatedValues: ['0', null, '', 'a'],
        validationError: undefined,
        value: 0,
        matchedValues: ['0'],
      });
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: [Number, String],
        default: 10,
      });
      expect(extractor(undefined).value).toBe(10);
      expect(extractor(null).value).toBe(10);
      expect(extractor('').value).toBe(10);
      expect(extractor('a').value).toBe('a');
      expect(extractor('1').value).toBe(1);
      expect(extractor([null, '', 'a', '1']).value).toBe('a');
      expect(extractor(['a', null, '', '1']).value).toBe('a');
      expect(extractor(['1', 'a', null, '']).value).toBe(1);
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: [Number, String],
        multiple: true,
      });
      expect(extractor(undefined).value).toStrictEqual([]);
      expect(extractor(null).value).toStrictEqual([]);
      expect(extractor('').value).toStrictEqual([]);
      expect(extractor('a').value).toStrictEqual(['a']);
      expect(extractor('1').value).toStrictEqual([1]);
      expect(extractor([null, '', 'a', '1'])).toMatchObject({
        state: 'found',
        source: [null, '', 'a', '1'],
        validatedValues: [null, '', 'a', '1'],
        validationError: undefined,
        value: ['a', 1],
        matchedValues: ['a', '1'],
      });
      expect(extractor(['a', null, '', '1']).value).toStrictEqual(['a', 1]);
    });
  });

  describe('union', () => {
    const TYPE = ['banana', '100', 'apple', 0, 100] as const;
    it('basic', () => {
      const extractor = createQueryValueExtractor(TYPE);
      expect(extractor(undefined).value).toBeUndefined();
      expect(extractor(null).value).toBeUndefined();
      expect(extractor('').value).toBeUndefined();
      expect(extractor('a').value).toBeUndefined();
      expect(extractor('1').value).toBeUndefined();
      expect(extractor('banana').value).toBe('banana');
      expect(extractor('apple').value).toBe('apple');
      expect(extractor('0').value).toBe(0);
      expect(extractor('100').value).toBe('100');
      expect(extractor([null, '', 'a', '1']).value).toBeUndefined();
      expect(extractor(['a', null, 'banana', '1'])).toMatchObject({
        state: 'found',
        source: ['a', null, 'banana', '1'],
        validatedValues: ['a', null, 'banana', '1'],
        validationError: undefined,
        value: 'banana',
        matchedValues: ['banana'],
      });
      expect(extractor(['banana', null, 'a', '1']).value).toBe('banana');
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: TYPE,
        default: 0,
      });
      expect(extractor(undefined).value).toBe(0);
      expect(extractor(null).value).toBe(0);
      expect(extractor('').value).toBe(0);
      expect(extractor('a')).toMatchObject({
        state: 'fallback-default',
        source: 'a',
        validatedValues: 'a',
        validationError: undefined,
        value: 0,
        matchedValues: [],
      });
      expect(extractor('0').value).toBe(0);
      expect(extractor('banana')).toMatchObject({
        state: 'found',
        source: 'banana',
        validatedValues: 'banana',
        validationError: undefined,
        value: 'banana',
        matchedValues: ['banana'],
      });
      expect(extractor('100').value).toBe('100');
      expect(extractor([null, '', 'a', '1']).value).toBe(0);
      expect(extractor(['a', null, 'banana', '1']).value).toBe('banana');
      expect(extractor(['banana', null, 'a', '1']).value).toBe('banana');
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: TYPE,
        multiple: true,
      });
      expect(extractor(undefined)).toMatchObject({
        state: 'fallback-default',
        source: undefined,
        validatedValues: undefined,
        validationError: undefined,
        value: [],
        matchedValues: [],
      });
      expect(extractor(null).value).toStrictEqual([]);
      expect(extractor('').value).toStrictEqual([]);
      expect(extractor('a').value).toStrictEqual([]);
      expect(extractor('0')).toMatchObject({
        state: 'found',
        source: '0',
        validatedValues: '0',
        validationError: undefined,
        value: [0],
        matchedValues: ['0'],
      });
      expect(extractor('banana').value).toStrictEqual(['banana']);
      expect(extractor('100').value).toStrictEqual(['100']);
      expect(extractor([null, '', 'a', '1']).value).toStrictEqual([]);
      expect(extractor(['0', null, 'banana', '1'])).toMatchObject({
        state: 'found',
        source: ['0', null, 'banana', '1'],
        validatedValues: ['0', null, 'banana', '1'],
        validationError: undefined,
        value: [0, 'banana'],
        matchedValues: ['0', 'banana'],
      });
    });
  });
});

describe('createQueriesExtractor', () => {
  function createSchema() {
    return {
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
    };
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
    expect(extractor.unionMultiple(['50', '2', 'apple']).value).toMatchObject([
      50,
      'apple',
    ]);
  });
});
