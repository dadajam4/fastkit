import { describe, it, expect } from 'vitest';
import { maxLength, required } from '../../rules';
import { fields, ValidationError } from '../..';
import { createFieldsRule } from '../';

interface UserType {
  type: string;
  desc: string;
}

interface User {
  name: string;
  email: string;
  type: UserType;
}

function createMessage(value: any) {
  if (value == null || typeof value !== 'object') {
    return `I meets value ${JSON.stringify(value)}`;
  } else {
    return `The user object does not meet the constraints.`;
  }
}

function createUserRule() {
  return createFieldsRule<User>({
    name: 'user',
    message: (value) => {
      return createMessage(value);
    },
    rules: {
      name: required,
      email: [required, maxLength(10)],
      type: createFieldsRule<UserType>({
        rules: {
          type: required,
          desc: {
            rules: [required, maxLength(10)],
            value(obj: any) {
              return obj.desc;
            },
          },
        },
      }),
    },
  });
}

describe('factories/fields', () => {
  describe('construct', () => {
    it(`default`, () => {
      const defo = fields({ rules: {} });
      expect(defo.$name).toStrictEqual('fields');
      expect(typeof defo.validate).toStrictEqual('function');
    });
    it(`extend`, () => {
      const userRule = createUserRule();
      expect(userRule.$name).toStrictEqual('user');
      expect(typeof userRule.validate).toStrictEqual('function');
      expect(typeof userRule.message).toStrictEqual('function');
    });
  });

  describe('validate', () => {
    const userRule = createUserRule();

    describe('not object values', () => {
      const values = [
        undefined,
        null,
        'string',
        0,
        true,
        false,
        Symbol('hoge'),
      ];

      let i = 0;
      for (const value of values) {
        i++;
        it(`not object values: ${i}`, async () => {
          const result = (await userRule.validate(value)) as ValidationError;
          expect(result.name).toStrictEqual('user');
          expect(result.eachPrefix).toStrictEqual(undefined);
          expect(result.path).toStrictEqual(undefined);
          expect(result.fullPath).toStrictEqual(undefined);
          expect(result.value).toStrictEqual(value);
          expect(result.message).toStrictEqual(
            `I meets value ${JSON.stringify(value)}`,
          );
          expect(result.children).toStrictEqual(undefined);
        });
      }
    });

    describe('empty value with skip option', () => {
      const values = [undefined, null];

      let i = 0;
      const extendedUserRule = userRule(
        {
          skipIfEmpty: true,
        },
        {
          name: 'extendedUserRule',
        },
      );
      for (const value of values) {
        i++;
        it(`empty value with skip option: ${i}`, async () => {
          const result = (await extendedUserRule.validate(
            value,
          )) as ValidationError;
          expect(result).toBeUndefined();
        });
      }
    });

    describe('empty object and object like values', () => {
      let i = 0;
      const values = [
        {},
        [1, '2', false],
        new (class Hoge {
          hoge = 1;
        })(),
        new Date(),
      ];

      const expectValueSnapShot = {
        $$symbol: 'ValidationError',
        name: 'user',
        eachPrefix: undefined,
        path: 'user',
        fullPath: '["user"]',
        value: {},
        message: 'The user object does not meet the constraints.',
        children: [
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: '["user"]',
            path: 'name',
            fullPath: '["user"]["name"]',
            value: undefined,
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'required',
            eachPrefix: '["user"]',
            path: 'email',
            fullPath: '["user"]["email"]',
            value: undefined,
            message: 'This item is required.',
            children: undefined,
          },
          {
            $$symbol: 'ValidationError',
            name: 'fields',
            eachPrefix: '["user"]',
            path: 'type',
            fullPath: '["user"]["type"]',
            value: undefined,
            message: 'The object does not meet the constraints.',
            children: undefined,
          },
        ],
      };

      for (const value of values) {
        i++;
        it(`empty object and object like values: ${i}`, async () => {
          const result = (await userRule.validate(value, {
            path: 'user',
          })) as ValidationError;
          expect(result).toEqual({
            ...JSON.parse(JSON.stringify(expectValueSnapShot)),
            message: createMessage(value),
            value,
          });
        });
      }
    });

    describe('deep path', () => {
      it(`deep path failed`, async () => {
        const value: User = {
          name: '',
          email: 'hogehoge@fugafuga.com',
          type: {
            type: '',
            desc: 'abcdefg1234567890',
          },
        };
        const result = await userRule.validate(value, {
          path: 2,
        });
        const expectValueSnapShot = {
          $$symbol: 'ValidationError',
          name: 'user',
          path: 2,
          fullPath: '[2]',
          value: {
            name: '',
            email: 'hogehoge@fugafuga.com',
            type: {
              type: '',
              desc: 'abcdefg1234567890',
            },
          },
          message: 'The user object does not meet the constraints.',
          children: [
            {
              $$symbol: 'ValidationError',
              name: 'required',
              eachPrefix: '[2]',
              path: 'name',
              fullPath: '[2]["name"]',
              value: '',
              message: 'This item is required.',
            },
            {
              $$symbol: 'ValidationError',
              name: 'maxLength',
              eachPrefix: '[2]',
              path: 'email',
              fullPath: '[2]["email"]',
              value: 'hogehoge@fugafuga.com',
              message: 'Please enter 10 characters or less.',
            },
            {
              $$symbol: 'ValidationError',
              name: 'fields',
              eachPrefix: '[2]',
              path: 'type',
              fullPath: '[2]["type"]',
              value: {
                type: '',
                desc: 'abcdefg1234567890',
              },
              message: 'The object does not meet the constraints.',
              children: [
                {
                  $$symbol: 'ValidationError',
                  name: 'required',
                  eachPrefix: '[2]["type"]',
                  path: 'type',
                  fullPath: '[2]["type"]["type"]',
                  value: '',
                  message: 'This item is required.',
                },
                {
                  $$symbol: 'ValidationError',
                  name: 'maxLength',
                  eachPrefix: '[2]["type"]',
                  path: 'desc',
                  fullPath: '[2]["type"]["desc"]',
                  value: 'abcdefg1234567890',
                  message: 'Please enter 10 characters or less.',
                },
              ],
            },
          ],
        };
        expect(result).toEqual({
          ...JSON.parse(JSON.stringify(expectValueSnapShot)),
        });
      });
      it(`deep path success`, async () => {
        const value: User = {
          name: 'hello',
          email: 'a@b.com',
          type: {
            type: 'fuga',
            desc: 'hello',
          },
        };
        const result = await userRule.validate(value);
        expect(result).toStrictEqual(undefined);
      });
    });
  });
});
