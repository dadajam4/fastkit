import { ValidationError } from '../schemes';
import { objectPathJoin } from '../utils';
import { validate } from '../services';
import { Rule, createRule, RuleSettingsMessage } from './rule';
import { RecursiveArray } from '@fastkit/helpers';

interface Fields {
  [key: string]: any;
}

export interface FieldsRuleConstraints<T extends Fields = Fields> {
  skipIfEmpty?: boolean;
  rules: Partial<{
    [K in keyof T]: RecursiveArray<Rule> | FieldsRuleSettingsRule<T>;
  }>;
}

export interface FieldsRuleSettings<T extends Fields = Fields>
  extends FieldsRuleConstraints<T> {
  name?: string;
  message?: RuleSettingsMessage<FieldsRuleConstraints<T>>;
}

export interface FieldsRuleSettingsRule<T extends Fields = Fields> {
  rules: RecursiveArray<Rule>;
  value?: (obj: T) => any;
}

interface FieldsRuleSettingsRow<T extends Fields = Fields>
  extends FieldsRuleSettingsRule<T> {
  path: string;
}

export function createFieldsRule<T extends Fields = Fields>(
  settings: FieldsRuleSettings<T>,
): Rule<FieldsRuleConstraints<T>> {
  const {
    name = 'fields',
    message = 'The object does not meet the constraints.',
    rules,
    skipIfEmpty = false,
  } = settings;

  const constraints: FieldsRuleConstraints<T> = {
    skipIfEmpty,
    rules,
  };

  const rule = createRule({
    name,
    message,
    constraints,
    validate: async (obj: T, constraints) => {
      const { skipIfEmpty, rules } = constraints;
      if (skipIfEmpty && obj == null) return true;
      if (!obj || typeof obj !== 'object') return false;

      const paths = Object.keys(rules);
      const ruleSettings: FieldsRuleSettingsRow<T>[] = paths.map((path) => {
        let setting = rules[path] as
          | RecursiveArray<Rule>
          | FieldsRuleSettingsRule<T>;

        if (typeof setting === 'function' || Array.isArray(setting)) {
          setting = {
            rules: setting,
          };
        }
        return {
          path,
          ...setting,
        };
      });

      const errors: ValidationError[] = [];
      const { eachPrefix: parentEachPrefix, path: parentPath } =
        rule._lastValidateOptions;
      const parentFullPath = objectPathJoin(parentEachPrefix, parentPath);
      await Promise.all(
        ruleSettings.map(async (row) => {
          const { path, rules, value: valueGetter } = row;
          const opts = { eachPrefix: parentFullPath, path };
          const value = valueGetter ? valueGetter(obj) : obj[path];
          const rowErrors = await validate(value, rules, opts);
          if (rowErrors) errors.push(...rowErrors);
        }),
      );
      return errors.length ? errors : true;
    },
  });
  return rule;
}

export const fields = createFieldsRule;
