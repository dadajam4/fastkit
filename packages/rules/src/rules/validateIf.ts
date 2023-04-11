import { createRule, Rule } from '../factories';
import { ValidateCancelSymbol } from '../schemes';
import { REQUIRED_SYMBOL } from './required';
import { isRequired } from '../validators/general';

export type ValidateIfChecker = (value: any) => boolean | void;

export const VALIDATE_IF_SYMBOL = 'validateIf';

export const validateIf = createRule<ValidateIfChecker>({
  name: VALIDATE_IF_SYMBOL,
  validate: (value, checker) => {
    return checker(value) ? true : ValidateCancelSymbol;
  },
  constraints: (value) => {
    return isRequired(value);
  },
});

export function convertRequiredToValidateIf(rules: Rule[]): Rule[] {
  return rules.map((rule) => {
    if (rule.$name === REQUIRED_SYMBOL) {
      return validateIf;
    } else {
      return rule;
    }
  });
}
