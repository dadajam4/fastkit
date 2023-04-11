import { ValidationError } from '../schemes';
import { objectPathJoin } from '../utils';
import { validate } from '../services';
import { Rule, createRule, RuleSettingsMessage } from './rule';
import { RecursiveArray } from '@fastkit/helpers';

export interface EachRuleConstraints {
  skipIfEmpty?: boolean;
  rules: RecursiveArray<Rule>;
}

export interface EachRuleSettings {
  name?: string;
  message?: RuleSettingsMessage<EachRuleConstraints>;
  skipIfEmpty?: boolean;
  rules: RecursiveArray<Rule>;
}

export function createEachRule(
  settings: EachRuleSettings,
): Rule<EachRuleConstraints> {
  const {
    name = 'each',
    message = 'The list or object does not meet the constraints.',
    rules,
    skipIfEmpty = false,
  } = settings;

  const constraints: EachRuleConstraints = {
    skipIfEmpty,
    rules,
  };

  const rule = createRule({
    name,
    message,
    constraints,
    validate: async (obj: any, constraints) => {
      const { skipIfEmpty, rules } = constraints;
      if (skipIfEmpty && obj == null) return true;
      const isArray = Array.isArray(obj);
      if (!obj || (typeof obj !== 'object' && !isArray)) return false;
      const errors: ValidationError[] = [];
      const { eachPrefix: parentEachPrefix, path: parentPath } =
        rule._lastValidateOptions;
      const parentFullPath = objectPathJoin(parentEachPrefix, parentPath);
      const paths = Object.keys(obj);
      await Promise.all(
        paths.map(async (_path) => {
          const value = obj[_path];
          const path = isArray ? Number(_path) : _path;
          const opts = { eachPrefix: parentFullPath, path };
          const rowErrors = await validate(value, rules, opts);
          if (rowErrors) errors.push(...rowErrors);
        }),
      );
      return errors.length ? errors : true;
    },
  });
  return rule;
}

export const each = createEachRule;
