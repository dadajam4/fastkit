import { describe, it, expect } from 'vitest';
import { mergeDefaults, createIndexSignatureDefaultsSchema } from '../src';
import type { DefaultsSchema, DefaultsSchemaSource } from '../src';

describe('mergeDefaults', () => {
  it('should fill a missing primitive from its factory', () => {
    const schema: DefaultsSchema<{ a?: number; b?: number }> = {
      a: () => 1,
      b: () => 2,
    };
    expect(mergeDefaults({ a: 10 }, schema)).toStrictEqual({ a: 10, b: 2 });
  });

  it('should keep a value that is present but falsy', () => {
    expect(mergeDefaults({ a: 0 }, { a: () => 1 })).toStrictEqual({ a: 0 });
  });

  it('should walk into a nested object, creating it when absent', () => {
    const schema: DefaultsSchema<{ nested?: { a?: number; b?: number } }> = {
      nested: { a: () => 1, b: () => 2 },
    };
    expect(mergeDefaults({ nested: { a: 10 } }, schema)).toStrictEqual({
      nested: { a: 10, b: 2 },
    });
    expect(mergeDefaults({}, schema)).toStrictEqual({ nested: { a: 1, b: 2 } });
  });

  it('should apply an array schema to every item', () => {
    const schema: DefaultsSchema<{ rows?: { a?: number; b?: number }[] }> = {
      rows: [{ a: () => 1, b: () => 2 }],
    };
    expect(mergeDefaults({ rows: [{ a: 10 }, {}] }, schema)).toStrictEqual({
      rows: [
        { a: 10, b: 2 },
        { a: 1, b: 2 },
      ],
    });
  });

  it('should fall back for an array item that is not an object', () => {
    const schema: DefaultsSchemaSource<{ a?: number }[]> = [
      { a: () => 1 },
      (notObject) => (notObject === null ? undefined : { a: 5 }),
    ];
    expect(
      mergeDefaults({ rows: [1, null] }, { rows: schema } as any),
    ).toStrictEqual({ rows: [{ a: 5 }] });
  });

  it('should seed an empty array from its factory', () => {
    const schema: DefaultsSchema<{ rows?: number[] }> = {
      rows: [() => [1, 2]],
    };
    expect(mergeDefaults({}, schema)).toStrictEqual({ rows: [1, 2] });
    expect(mergeDefaults({ rows: [3] }, schema)).toStrictEqual({ rows: [3] });
  });
});

describe('createIndexSignatureDefaultsSchema', () => {
  it('should apply one schema to every key of the base', () => {
    const schema = createIndexSignatureDefaultsSchema<{ a?: number }>({
      a: () => 1,
    });
    expect(mergeDefaults({ x: { a: 10 }, y: {} }, schema as any)).toStrictEqual(
      { x: { a: 10 }, y: { a: 1 } },
    );
  });
});
