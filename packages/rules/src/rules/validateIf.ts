import { createRule, Rule } from '../factories';
import { VALIDATE_CANCEL_SYMBOL } from '../schemes';
import { REQUIRED_SYMBOL } from './required';
import { isRequired } from '../validators/general';

export type ValidateIfChecker = (value: any) => boolean | void;

export const VALIDATE_IF_SYMBOL = 'validateIf';

export const validateIf = createRule<ValidateIfChecker>({
  name: VALIDATE_IF_SYMBOL,
  validate: (value, checker) =>
    checker(value) ? true : VALIDATE_CANCEL_SYMBOL,
  constraints: (value) => isRequired(value),
});

export function convertRequiredToValidateIf(rules: Rule[]): Rule[] {
  return rules.map((rule) => {
    if (rule.$name === REQUIRED_SYMBOL) {
      return validateIf;
    }
    return rule;
  });
}
