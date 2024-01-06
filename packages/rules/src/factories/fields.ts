import { ValidationError } from '../schemes';
import { objectPathJoin } from '../utils';
import { validate } from '../services';
import { Rule, createRule, RuleBasicSettings } from './rule';
import { RecursiveArray } from '@fastkit/helpers';

interface Fields {
  [key: string]: any;
}

/**
 * Constraints for the rule that executes validation for each field of the object.
 */
export interface FieldsRuleConstraints<T extends Fields = Fields> {
  /**
   * Skip validation if the array or object is nullable.
   */
  skipIfEmpty?: boolean;
  /**
   * Rule to apply to the field or its recursive array.
   *
   * @see {@link Rule}
   * @see {@link FieldsRuleSettingsRule}
   */
  rules: Partial<{
    [K in keyof T]: RecursiveArray<Rule> | FieldsRuleSettingsRule<T>;
  }>;
}

/**
 * Settings for the rule that executes validation for each field of the object.
 */
export interface FieldsRuleSettings<T extends Fields = Fields>
  extends Partial<RuleBasicSettings<FieldsRuleConstraints<T>>>,
    FieldsRuleConstraints<T> {}

/**
 * Field rule settings for the rule that executes validation for each field of the object.
 */
export interface FieldsRuleSettingsRule<T extends Fields = Fields> {
  /** Rule to apply to the field or its recursive array. */
  rules: RecursiveArray<Rule>;
  /**
   * Getter for passing values to the field validation rule.
   *
   * Usually, the object value for the field name is used. Set this if you want to customize it.
   *
   * @param obj - Object
   * @returns Value to be validated.
   */
  value?: (obj: T) => any;
}

interface FieldsRuleSettingsRow<T extends Fields = Fields>
  extends FieldsRuleSettingsRule<T> {
  path: string;
}

/**
 * Create a rule to execute validation for each field of the object.
 *
 * @param settings - Settings for the rule that executes validation for each field of the object.
 * @returns Rule to execute validation for each field of the object.
 *
 * @see {@link FieldsRuleSettings}
 */
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
        rule._lastValidationOptions;
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
