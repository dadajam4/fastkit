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
      expect(extractor(undefined)).toBeUndefined();
      expect(extractor(null)).toBeUndefined();
      expect(extractor('')).toBeUndefined();
      expect(extractor('a')).toBe('a');
      expect(extractor('1')).toBe('1');
      expect(extractor([null, '', 'a', '1'])).toBeUndefined();
      expect(extractor(['a', null, '', '1'])).toBe('a');
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: String,
        default: '',
      });
      expect(extractor(undefined)).toBe('');
      expect(extractor(null)).toBe('');
      expect(extractor('')).toBe('');
      expect(extractor('a')).toBe('a');
      expect(extractor('1')).toBe('1');
      expect(extractor([null, '', 'a', '1'])).toBe('');
      expect(extractor(['a', null, '', '1'])).toBe('a');
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: String,
        multiple: true,
      });
      expect(extractor(undefined)).toStrictEqual([]);
      expect(extractor(null)).toStrictEqual([]);
      expect(extractor('')).toStrictEqual([]);
      expect(extractor('a')).toStrictEqual(['a']);
      expect(extractor('1')).toStrictEqual(['1']);
      expect(extractor([null, '', 'a', '1'])).toStrictEqual(['a', '1']);
      expect(extractor(['a', null, '', '1'])).toStrictEqual(['a', '1']);
    });
  });

  describe('number', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor(Number);
      expect(extractor(undefined)).toBeUndefined();
      expect(extractor(null)).toBeUndefined();
      expect(extractor('')).toBeUndefined();
      expect(extractor('a')).toBeUndefined();
      expect(extractor('0')).toBe(0);
      expect(extractor('1')).toBe(1);
      expect(extractor([null, '', 'a', '1'])).toBeUndefined();
      expect(extractor(['1', 'a', null, ''])).toBe(1);
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: Number,
        default: 10,
      });
      expect(extractor(undefined)).toBe(10);
      expect(extractor(null)).toBe(10);
      expect(extractor('')).toBe(10);
      expect(extractor('a')).toBe(10);
      expect(extractor('1')).toBe(1);
      expect(extractor([null, '', 'a', '1'])).toBe(10);
      expect(extractor(['1', 'a', null, ''])).toBe(1);
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: Number,
        multiple: true,
      });
      expect(extractor(undefined)).toStrictEqual([]);
      expect(extractor(null)).toStrictEqual([]);
      expect(extractor('')).toStrictEqual([]);
      expect(extractor('a')).toStrictEqual([]);
      expect(extractor('10')).toStrictEqual([10]);
      expect(extractor([null, '', '0', '1', 'a', '10'])).toStrictEqual([
        0, 1, 10,
      ]);
      expect(extractor(['10', 'a', '1', null, '0', ''])).toStrictEqual([
        10, 1, 0,
      ]);
    });
  });

  describe('boolean', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor(Boolean);
      expect(extractor(undefined)).toBe(false);
      expect(extractor(null)).toBe(true);
      expect(extractor('')).toBe(false);
      expect(extractor('a')).toBe(false);
      expect(extractor('true')).toBe(true);
      expect(extractor('false')).toBe(false);
      expect(extractor('1')).toBe(false);
      expect(extractor('0')).toBe(false);
      expect(extractor(['', null, 'a', '1'])).toBe(false);
      expect(extractor([null, '', 'a', '1'])).toBe(true);
      expect(extractor(['true', null, 'a', '1'])).toBe(true);
      expect(extractor([null, 'false', 'a', '1'])).toBe(true);
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: Boolean,
        default: true,
      });
      expect(extractor(undefined)).toBe(true);
      expect(extractor(null)).toBe(true);
      expect(extractor('')).toBe(true);
      expect(extractor('a')).toBe(true);
      expect(extractor('true')).toBe(true);
      expect(extractor('false')).toBe(false);
      expect(extractor('1')).toBe(true);
      expect(extractor('0')).toBe(true);
      expect(extractor(['', null, 'a', '1'])).toBe(true);
      expect(extractor([null, '', 'a', '1'])).toBe(true);
      expect(extractor(['false', null, 'a', '1'])).toBe(false);
      expect(extractor([null, 'false', 'a', '1'])).toBe(true);
    });
  });

  describe('number -> string union', () => {
    it('basic', () => {
      const extractor = createQueryValueExtractor([Number, String]);
      expect(extractor(undefined)).toBeUndefined();
      expect(extractor(null)).toBeUndefined();
      expect(extractor('')).toBeUndefined();
      expect(extractor('a')).toBe('a');
      expect(extractor('1')).toBe(1);
      expect(extractor([null, '', 'a', '1'])).toBeUndefined();
      expect(extractor(['a', null, '', '1'])).toBe('a');
      expect(extractor(['0', null, '', 'a'])).toBe(0);
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: [Number, String],
        default: 10,
      });
      expect(extractor(undefined)).toBe(10);
      expect(extractor(null)).toBe(10);
      expect(extractor('')).toBe(10);
      expect(extractor('a')).toBe('a');
      expect(extractor('1')).toBe(1);
      expect(extractor([null, '', 'a', '1'])).toBe(10);
      expect(extractor(['a', null, '', '1'])).toBe('a');
      expect(extractor(['1', 'a', null, ''])).toBe(1);
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: [Number, String],
        multiple: true,
      });
      expect(extractor(undefined)).toStrictEqual([]);
      expect(extractor(null)).toStrictEqual([]);
      expect(extractor('')).toStrictEqual([]);
      expect(extractor('a')).toStrictEqual(['a']);
      expect(extractor('1')).toStrictEqual([1]);
      expect(extractor([null, '', 'a', '1'])).toStrictEqual(['a', 1]);
      expect(extractor(['a', null, '', '1'])).toStrictEqual(['a', 1]);
    });
  });

  describe('union', () => {
    const TYPE = ['banana', '100', 'apple', 0, 100] as const;
    it('basic', () => {
      const extractor = createQueryValueExtractor(TYPE);
      expect(extractor(undefined)).toBeUndefined();
      expect(extractor(null)).toBeUndefined();
      expect(extractor('')).toBeUndefined();
      expect(extractor('a')).toBeUndefined();
      expect(extractor('1')).toBeUndefined();
      expect(extractor('banana')).toBe('banana');
      expect(extractor('apple')).toBe('apple');
      expect(extractor('0')).toBe(0);
      expect(extractor('100')).toBe('100');
      expect(extractor([null, '', 'a', '1'])).toBeUndefined();
      expect(extractor(['a', null, 'banana', '1'])).toBeUndefined();
      expect(extractor(['banana', null, 'a', '1'])).toBe('banana');
    });

    it('with default', () => {
      const extractor = createQueryValueExtractor({
        type: TYPE,
        default: 0,
      });
      expect(extractor(undefined)).toBe(0);
      expect(extractor(null)).toBe(0);
      expect(extractor('')).toBe(0);
      expect(extractor('a')).toBe(0);
      expect(extractor('0')).toBe(0);
      expect(extractor('banana')).toBe('banana');
      expect(extractor('100')).toBe('100');
      expect(extractor([null, '', 'a', '1'])).toBe(0);
      expect(extractor(['a', null, 'banana', '1'])).toBe(0);
      expect(extractor(['banana', null, 'a', '1'])).toBe('banana');
    });

    it('multiple', () => {
      const extractor = createQueryValueExtractor({
        type: TYPE,
        multiple: true,
      });
      expect(extractor(undefined)).toStrictEqual([]);
      expect(extractor(null)).toStrictEqual([]);
      expect(extractor('')).toStrictEqual([]);
      expect(extractor('a')).toStrictEqual([]);
      expect(extractor('0')).toStrictEqual([0]);
      expect(extractor('banana')).toStrictEqual(['banana']);
      expect(extractor('100')).toStrictEqual(['100']);
      expect(extractor([null, '', 'a', '1'])).toStrictEqual([]);
      expect(extractor(['0', null, 'banana', '1'])).toStrictEqual([
        0,
        'banana',
      ]);
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
    expect(extractor.unionMultiple(['50', '2', 'apple'])).toMatchObject([
      50,
      'apple',
    ]);
  });
});
