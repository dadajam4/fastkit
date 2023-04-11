/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect } from 'vitest';
import { isEmpty, getLength } from '../general';

interface ListExpectedObjectItem<V extends () => unknown> {
  value?: any;
  result: ReturnType<V>;
  valueString?: string;
  args?: Parameters<V>;
}

type ListExpectedArrayItem<V extends () => unknown> = [
  any,
  ReturnType<V>,
  string?,
];

type ListExpectedItem<V extends () => unknown> =
  | ListExpectedObjectItem<V>
  | ListExpectedArrayItem<V>;

function listExpected<V extends (...args: unknown[]) => unknown>(
  validator: V,
  items: ListExpectedItem<V>[],
) {
  for (const _item of items) {
    const item: ListExpectedObjectItem<V> = Array.isArray(_item)
      ? {
          value: _item[0],
          result: _item[1],
          valueString: _item[2],
        }
      : _item;
    const { value, result } = item;
    const valueString = item.valueString || JSON.stringify(value);
    it(`${valueString} -> should be ${result}`, () => {
      expect(validator(value)).toStrictEqual(result);
    });
  }
}

describe('general', () => {
  describe('isEmpty()', () => {
    listExpected(isEmpty, [
      [undefined, true],
      ['', true],
      [false, true],
      [null, true],
      [[], true],
      [' ', false],
      [0, false],
      [-1, false],
      [true, false],
      [{}, false],
      [new Date(), false, 'new Date()'],
      [function () {}, false, 'function () {}'],
      [class {}, false, 'class {}'],
      [Symbol(''), false, 'Symbol()'],
    ]);
  });

  describe('getLength()', () => {
    listExpected(getLength, [
      [undefined, 0],
      ['', 0],
      [false, 0],
      [null, 0],
      [[], 0],
      [true, 0],
      [{}, 0],
      [new Date(), 0, 'new Date()'],
      [function () {}, 0, 'function () {}'],
      [class {}, 0, 'class {}'],
      [
        class {
          x = 1;
          y() {}
        },
        0,
        'class { x = 1; y() {} }',
      ],
      [Symbol(''), 0, 'Symbol()'],
      [' ', 1],
      [0, 1],
      [-1, 2],
      [[null, null], 2],
      [{ a: 1, b: () => {} }, 2, '{ a: 1, b: () => {} }'],
    ]);
  });
});
