import {
  ValidationError,
  isValidateCancelSymbol,
  ValidationErrorSymbol,
} from '../schemes';
import { Rule, RuleValidateOptions } from '../factories';
import { RecursiveArray, flattenRecursiveArray } from '@fastkit/helpers';

export interface ValidateOptions {
  forceAll?: boolean;
  path?: string | number;
  eachPrefix?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ValidatableRule
  extends Pick<Rule, 'validate' | 'message' | '$name'> {}

export async function validate(
  value: any,
  rules: RecursiveArray<ValidatableRule>,
  options: ValidateOptions = {},
): Promise<ValidationError[] | undefined> {
  const errors: ValidationError[] = [];
  const { forceAll, path, eachPrefix } = options;

  const _rules = flattenRecursiveArray(rules);

  const opts: RuleValidateOptions = { path, eachPrefix };

  try {
    for (const rule of _rules) {
      const error = await rule.validate(value, opts);
      if (!error) continue;
      if (isValidateCancelSymbol(error)) break;
      errors.push(error);
      if (!forceAll) break;
    }
  } catch (err: any) {
    let name = 'exception';
    let message = 'An unexpected error has occurred.';
    let fullPath: string | undefined;
    if (err && typeof err === 'object') {
      name = err.name || name;
      message = err.message || message;
      fullPath = err.fullPath || fullPath;
    }

    errors.push({
      $$symbol: ValidationErrorSymbol,
      name,
      message,
      path,
      fullPath,
    });
  }
  return (errors.length && errors) || undefined;
}
