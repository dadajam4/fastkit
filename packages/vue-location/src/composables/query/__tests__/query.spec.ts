import { describe, it, expect, beforeEach } from 'vitest';
import {
  createRouter,
  createMemoryHistory,
  LocationQueryRaw,
} from 'vue-router';
import { defineQueriesSchema } from '../helpers';
import { useTypedQuery } from '../query';

const schema = defineQueriesSchema({
  // string: `string | undefined`
  string: String,
  // string: `string | undefined`
  stringAlias: {
    aliasFor: 'string2',
    type: String,
  },
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
  // custom boolean `boolean`
  customBoolean: {
    type: Boolean,
    booleanSchema: '1/0',
  },
  // strict boolean `boolean`
  strictBoolean: {
    type: Boolean,
    booleanSchema: {
      nullToTrue: false,
    },
  },
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

async function initRouter(query?: LocationQueryRaw) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/some-route',
        component: {},
      },
      {
        path: '/another-route',
        component: {},
      },
    ],
  });

  await router.push({
    path: '/some-route',
    query,
  });
  await router.isReady();
  return router;
}

beforeEach(async () => {});

describe('useTypedQuery', () => {
  it('construct', async () => {
    const router = await initRouter();
    const query = useTypedQuery(schema, router);

    expect(Object.keys(query)).toStrictEqual([
      'stringWithDefault',
      'stringMultiple',
      'numberWithDefault',
      'numberMultiple',
      'boolean',
      'customBoolean',
      'strictBoolean',
      'booleanWithDefault',
      'stringOrNumberMultiple',
      'unionMultiple',
    ]);
    expect(Object.keys(query.$extractors)).toStrictEqual(Object.keys(schema));
    expect(query.$ensure).toBeTypeOf('function');
    expect(query.$serialize).toBeTypeOf('function');
    expect(query.$location).toBeTypeOf('function');
    expect(query.$push).toBeTypeOf('function');
    expect(query.$replace).toBeTypeOf('function');
    const current = { ...query };
    expect(current).toStrictEqual({
      stringWithDefault: '',
      stringMultiple: [],
      numberWithDefault: 1,
      numberMultiple: [],
      boolean: false,
      booleanWithDefault: true,
      customBoolean: false,
      strictBoolean: false,
      stringOrNumberMultiple: [],
      unionMultiple: [],
    });
  });

  it('initial value', async () => {
    const router = await initRouter();
    await router.push({
      path: router.currentRoute.value.path,
      query: {
        number: '123',
      },
    });
    const query = useTypedQuery(schema, router);
    expect(query.string).toBeUndefined();
    expect(query.number).toBe(123);
    expect(query.boolean).toBe(false);
  });

  it('alias', async () => {
    const router = await initRouter();
    await router.push({
      path: router.currentRoute.value.path,
      query: {
        string2: 'hello',
      },
    });
    const query = useTypedQuery(schema, router);
    expect(query.stringAlias).toBe('hello');
  });

  it('dynamic value', async () => {
    const router = await initRouter();
    const query = useTypedQuery(schema, router);
    expect(query.string).toBeUndefined();
    expect(query.stringAlias).toBeUndefined();
    expect(query.number).toBeUndefined();
    expect(query.boolean).toBe(false);
    expect(query.customBoolean).toBe(false);

    await router.push({
      path: router.currentRoute.value.path,
      query: {
        string: 'abc',
        string2: 'def',
        number: '123',
        boolean: 'true',
        customBoolean: '1',
      },
    });

    expect(query.string).toBe('abc');
    expect(query.stringAlias).toBe('def');
    expect(query.number).toBe(123);
    expect(query.boolean).toBe(true);
    expect(query.customBoolean).toBe(true);
  });

  it('ensure', async () => {
    const router = await initRouter();
    const query = useTypedQuery(schema, router);
    expect(() => query.$ensure('string')).toThrowError();
    expect(query.$ensure('stringWithDefault')).toBe('');
    expect(query.$ensure('numberWithDefault')).toBe(1);
    expect(query.$ensure('stringOrNumberMultiple')).toStrictEqual([]);
  });

  describe('serialize', () => {
    it('current query', async () => {
      const router = await initRouter();
      const query = useTypedQuery(schema, router);
      expect(query.$serializeCurrentValues()).toStrictEqual({
        stringWithDefault: '',
        numberWithDefault: '1',
        boolean: 'false',
        booleanWithDefault: 'true',
        customBoolean: '0',
        strictBoolean: 'false',
      });

      await router.push({
        path: router.currentRoute.value.path,
        query: {
          string: 'abc',
          string2: 'def',
          number: '123',
          boolean: null,
          customBoolean: '1',
          strictBoolean: null,
        },
      });

      expect({ ...query }).toStrictEqual({
        boolean: true,
        booleanWithDefault: true,
        customBoolean: true,
        number: 123,
        numberMultiple: [],
        numberWithDefault: 1,
        strictBoolean: false,
        string: 'abc',
        stringAlias: 'def',
        stringMultiple: [],
        stringOrNumberMultiple: [],
        stringWithDefault: '',
        unionMultiple: [],
      });

      expect(query.$serializeCurrentValues()).toStrictEqual({
        string: 'abc',
        string2: 'def',
        stringWithDefault: '',
        number: '123',
        numberWithDefault: '1',
        boolean: 'true',
        customBoolean: '1',
        strictBoolean: 'false',
        booleanWithDefault: 'true',
      });
    });

    it('specified query', async () => {
      const router = await initRouter();
      const query = useTypedQuery(schema, router);
      const specified = query.$serialize({
        string: 'abc',
        stringAlias: 'def',
        number: 123,
        numberWithDefault: 20,
        boolean: true,
        stringOrNumberMultiple: [1, 'apple'],
      });
      expect(specified).toStrictEqual({
        string: 'abc',
        string2: 'def',
        number: '123',
        numberWithDefault: '20',
        boolean: 'true',
        stringOrNumberMultiple: ['1', 'apple'],
      });
    });

    it('merged query', async () => {
      const router = await initRouter();
      const query = useTypedQuery(schema, router);
      const specified = query.$serialize(
        {
          string: 'abc',
          stringAlias: 'def',
          number: 123,
          numberWithDefault: 20,
          boolean: true,
          stringOrNumberMultiple: [1, 'apple'],
        },
        true,
      );
      expect(specified).toStrictEqual({
        booleanWithDefault: 'true',
        customBoolean: '0',
        strictBoolean: 'false',
        stringWithDefault: '',
        string: 'abc',
        string2: 'def',
        number: '123',
        numberWithDefault: '20',
        boolean: 'true',
        stringOrNumberMultiple: ['1', 'apple'],
      });
    });
  });

  describe('location', () => {
    it('reset', async () => {
      const router = await initRouter({
        numberMultiple: ['1', '2'],
      });
      const query = useTypedQuery(schema, router);
      const loc = query.$location({
        string: 'abc',
        stringAlias: 'def',
        number: 123,
        numberWithDefault: 20,
        boolean: true,
        stringOrNumberMultiple: [1, 'apple'],
      });
      expect(loc.query).toStrictEqual({
        string: 'abc',
        string2: 'def',
        number: '123',
        numberWithDefault: '20',
        boolean: 'true',
        stringOrNumberMultiple: ['1', 'apple'],
      });
    });

    it('merge', async () => {
      const router = await initRouter({
        string: 'hello',
        numberMultiple: [1, 2],
      });
      const query = useTypedQuery(schema, router);
      const loc = query.$location(
        {
          string: 'abc',
          stringAlias: 'def',
          number: 123,
          numberWithDefault: 20,
          boolean: true,
          stringOrNumberMultiple: [1, 'apple'],
        },
        { merge: true },
      );

      expect(loc.query).toStrictEqual({
        string: 'abc',
        string2: 'def',
        number: '123',
        numberMultiple: ['1', '2'],
        numberWithDefault: '20',
        boolean: 'true',
        stringOrNumberMultiple: ['1', 'apple'],
      });
    });

    it('another-route', async () => {
      const router = await initRouter({
        string: 'hello',
        numberMultiple: [1, 2],
      });
      const query = useTypedQuery(schema, router);
      const loc = query.$location(
        {
          string: 'abc',
          stringAlias: 'def',
          number: 123,
          numberWithDefault: 20,
          boolean: true,
          stringOrNumberMultiple: [1, 'apple'],
        },
        { to: '/another-route', merge: true },
      );

      expect(loc.path).toBe('/another-route');
      expect(loc.query).toStrictEqual({
        string: 'abc',
        string2: 'def',
        number: '123',
        // numberMultiple: ['1', '2'],
        numberWithDefault: '20',
        boolean: 'true',
        stringOrNumberMultiple: ['1', 'apple'],
      });
    });
  });

  it('push', async () => {
    const router = await initRouter({
      string: 'before',
      stringOrNumber: 20,
    });
    const query = useTypedQuery(schema, router);
    await query.$push(
      {
        string: 'abc',
        stringAlias: 'def',
        number: 123,
        numberWithDefault: 20,
        boolean: true,
        stringOrNumberMultiple: [1, 'apple'],
      },
      { merge: true },
    );
    expect(router.currentRoute.value.query).toStrictEqual({
      string: 'abc',
      string2: 'def',
      number: '123',
      numberWithDefault: '20',
      boolean: 'true',
      stringOrNumber: '20',
      stringOrNumberMultiple: ['1', 'apple'],
    });
  });

  it('replace', async () => {
    const router = await initRouter({
      string: 'before',
      stringOrNumber: 20,
    });
    const query = useTypedQuery(schema, router);
    await query.$replace(
      {
        string: 'abc',
        stringAlias: 'def',
        number: 123,
        numberWithDefault: 20,
        boolean: true,
        stringOrNumberMultiple: [1, 'apple'],
      },
      { merge: true },
    );
    expect(router.currentRoute.value.query).toStrictEqual({
      string: 'abc',
      string2: 'def',
      number: '123',
      numberWithDefault: '20',
      boolean: 'true',
      stringOrNumber: '20',
      stringOrNumberMultiple: ['1', 'apple'],
    });
  });

  it('manual', async () => {
    const router = await initRouter();
    await router.push({
      path: router.currentRoute.value.path,
      query: {
        number: '123',
      },
    });
    const query = useTypedQuery(schema, router);
    expect(query.string).toBeUndefined();
    expect(query.number).toBe(123);
    expect(query.boolean).toBe(false);

    expect(query.$extractors.string('abc').value).toBe('abc');
    expect(query.$extractors.number('456').value).toBe(456);
    expect(query.$extractors.boolean('true').value).toBe(true);
  });

  it('states', async () => {
    const router = await initRouter();
    await router.push({
      path: router.currentRoute.value.path,
      query: {
        number: '123',
      },
    });
    const query = useTypedQuery(schema, router);
    expect(query.$states.string).toMatchObject({
      state: 'missing',
      source: undefined,
      validatedValues: undefined,
      validationError: undefined,
      value: undefined,
      matchedValues: [],
    });
    expect(query.$states.number).toMatchObject({
      state: 'found',
      source: '123',
      validatedValues: '123',
      validationError: undefined,
      value: 123,
      matchedValues: ['123'],
    });
  });
});
