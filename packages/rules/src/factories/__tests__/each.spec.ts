import { describe, it, expect } from 'vitest';
import { maxLength, required } from '../../rules';
import { createEachRule } from '../';

describe('factories/each', () => {
  describe('construct', () => {
    it(`default`, () => {
      const rule = createEachRule({
        rules: [required, maxLength(5)],
      });
      expect(rule.$name).toStrictEqual('each');
      expect(typeof rule.validate).toStrictEqual('function');
    });
    it(`extend`, () => {
      const rule = createEachRule({
        rules: [required, maxLength(5)],
      });
      const extendedRule = rule(
        {},
        {
          name: 'myRule',
        },
      );
      expect(extendedRule.$name).toStrictEqual('myRule');
      expect(typeof extendedRule.validate).toStrictEqual('function');
    });
  });
  describe('validate', () => {
    it(`simple`, async () => {
      const rule = createEachRule({
        rules: [required, maxLength(5)],
      });
      const currentDate = new Date();
      const list = [null, undefined, '', 'ab', 'abcdef', currentDate];
      const result = await rule.validate(list);
      const expectedValue = {
        $$symbol: 'ValidationError',
        name: 'each',
        eachPrefix: undefined,
        path: undefined,
        fullPath: undefined,
        value: [null, undefined, '', 'ab', 'abcdef', currentDate],
        message: 'The list or object does not meet the constraints.',
        children: [
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 0,
            fullPath: '[0]',
            value: null,
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 1,
            fullPath: '[1]',
            value: undefined,
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 2,
            fullPath: '[2]',
            value: '',
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'maxLength',
            eachPrefix: undefined,
            path: 4,
            fullPath: '[4]',
            value: 'abcdef',
            message: 'Please enter 5 characters or less.',
            children: undefined,
          },
        ],
      };
      expect(result).toEqual(expectedValue);
    });
    it(`with fields`, async () => {
      const myRule = createEachRule({
        rules: [required, maxLength(5)],
        message: 'hoge',
      });
      const arrayValue = [1, 2, 3, 4, 5, 6];
      const dateValue = new Date();
      const value = [
        undefined,
        null,
        '',
        'hoge',
        [],
        'hogehoge',
        [null],
        {},
        arrayValue,
        dateValue,
      ];
      const expectedValue = {
        $$symbol: 'ValidationError',
        name: 'each',
        eachPrefix: undefined,
        path: undefined,
        fullPath: undefined,
        value,
        message: 'hoge',
        children: [
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 0,
            fullPath: '[0]',
            value: undefined,
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 1,
            fullPath: '[1]',
            value: null,
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 2,
            fullPath: '[2]',
            value: '',
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: undefined,
            path: 4,
            fullPath: '[4]',
            value: [],
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'maxLength',
            eachPrefix: undefined,
            path: 5,
            fullPath: '[5]',
            value: 'hogehoge',
            message: 'Please enter 5 characters or less.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'maxLength',
            eachPrefix: undefined,
            path: 8,
            fullPath: '[8]',
            value: arrayValue,
            message: 'Please enter 5 items or less.',
            children: undefined,
          },
        ],
      };
      const result = await myRule.validate(value);
      expect(result).toEqual(expectedValue);
    });
    it(`empty list`, async () => {
      const myRule = createEachRule({
        rules: [required, maxLength(5)],
        message: 'hoge',
      });
      const result = await myRule.validate([]);
      expect(result).toStrictEqual(undefined);
    });
    it(`empty value`, async () => {
      const myRule = createEachRule({
        rules: [required, maxLength(5)],
        message: 'hoge',
      });
      const expectedValue = {
        $$symbol: 'ValidationError',
        name: 'each',
        eachPrefix: undefined,
        path: undefined,
        fullPath: undefined,
        value: undefined,
        message: 'hoge',
        children: undefined,
      };
      const result = await myRule.validate(undefined);
      expect(result).toEqual(expectedValue);
    });
    it(`empty value with skip option`, async () => {
      const myRule = createEachRule({
        rules: [required, maxLength(5)],
        message: 'hoge',
        skipIfEmpty: true,
      });
      const result1 = await myRule.validate(undefined);
      const result2 = await myRule.validate(null);
      expect(result1).toStrictEqual(undefined);
      expect(result2).toStrictEqual(undefined);
    });
  });
});
