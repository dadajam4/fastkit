import { RecursiveArray } from '@fastkit/helpers';
import { ValidationError } from '../schemes';
import { objectPathJoin } from '../utils';
import { validate } from '../services';
import { Rule, createRule, RuleBasicSettings } from './rule';

/**
 * Constraints for the rule enumerating array or object elements.
 */
export interface EachRuleConstraints {
  /**
   * Skip validation if the array or object is nullable.
   */
  skipIfEmpty?: boolean;
  /**
   * Rule to apply to each element or its recursive array.
   */
  rules: RecursiveArray<Rule>;
}

/**
 * Settings for the rule enumerating array or object elements.
 */
export interface EachRuleSettings
  extends Partial<RuleBasicSettings<EachRuleConstraints>>,
    EachRuleConstraints {}

/**
 * Create a rule for enumerating array or object elements.
 *
 * @param settings - Settings for the rule enumerating array or object elements.
 * @returns Rule for enumerating array or object elements.
 *
 * @see {@link EachRuleSettings}
 */
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
        rule._lastValidationOptions;
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
