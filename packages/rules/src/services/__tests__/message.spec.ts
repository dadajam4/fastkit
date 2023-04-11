/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect } from 'vitest';

import { required, length, each, ValidationError } from '../..';
import { RuleMessageService, RuleMessageResolver } from '../message';

describe('services/message', () => {
  describe('construct', () => {
    it(`default`, () => {
      const initialLength = RuleMessageService.resolvers.length;
      const resolver: RuleMessageResolver = (ctx) => {};
      const remover = RuleMessageService.addResolver(resolver);
      expect(typeof remover).toStrictEqual('function');
      expect(RuleMessageService.resolvers.length).toStrictEqual(
        initialLength + 1,
      );
      remover();
      expect(RuleMessageService.resolvers.length).toStrictEqual(initialLength);
      RuleMessageService.addResolver(resolver);
      expect(RuleMessageService.resolvers.length).toStrictEqual(
        initialLength + 1,
      );
      remover();
      expect(RuleMessageService.resolvers.length).toStrictEqual(initialLength);
    });

    it(`simple`, async () => {
      const eachRule = each({
        rules: [required, length(5)],
      });
      const value = ['', 'hoge'];
      const result1 = (await eachRule.validate(value)) as ValidationError;
      expect(result1.children![0].message).toStrictEqual(
        'This item is required.',
      );
      expect(result1.children![1].message).toStrictEqual(
        'Please enter 5 characters.',
      );
      const resolver: RuleMessageResolver = (ctx) => {
        if (ctx.name === 'each') {
          return `each error ${JSON.stringify(value)}`;
        } else if (ctx.name === 'length') {
          return `length error catch ${ctx.constraints} length`;
        }
      };
      const remover = RuleMessageService.addResolver(resolver);
      const result2 = (await eachRule.validate(value)) as ValidationError;
      expect(result2.children![0].message).toStrictEqual(
        'This item is required.',
      );
      expect(result2.children![1].message).toStrictEqual(
        'length error catch 5 length',
      );
      expect(result2.message).toStrictEqual('each error ["","hoge"]');

      remover();
      const result3 = (await eachRule.validate(value)) as ValidationError;
      expect(result3.children![0].message).toStrictEqual(
        'This item is required.',
      );
      expect(result3.children![1].message).toStrictEqual(
        'Please enter 5 characters.',
      );
    });
  });
});
