/* eslint-disable @typescript-eslint/no-empty-function */
import 'jest';
import { toFlattenedObject } from '../helpers';

describe('helpers', () => {
  describe(toFlattenedObject.name, () => {
    const testCases: [string, any, any][] = [
      [
        'Must be able to flatten objects.',
        {
          a: 1,
          b: {
            a: true,
          },
          c: [1, 2],
        },
        { a: 1, b: { a: true }, 'b.a': true, c: [1, 2], 'c.0': 1, 'c.1': 2 },
      ],
      ['An empty object must remain empty.', {}, {}],
      (() => {
        const fn = () => {};
        return [
          'Flattening is possible even if functions are included.',
          {
            a: 1,
            b: fn,
            c: [1, fn],
            d: {
              a: 1,
              b: fn,
              c: [1, fn],
            },
          },
          {
            a: 1,
            b: fn,
            c: [1, fn],
            'c.0': 1,
            'c.1': fn,
            d: {
              a: 1,
              b: fn,
              c: [1, fn],
            },
            'd.a': 1,
            'd.b': fn,
            'd.c': [1, fn],
            'd.c.0': 1,
            'd.c.1': fn,
          },
        ];
      })(),
    ];

    for (const [message, from, to] of testCases) {
      it(message, () => {
        const result = toFlattenedObject(from);
        expect(result).toStrictEqual(to);
      });
    }
  });
});
