import { RecursiveArray, flattenRecursiveArray } from '@fastkit/helpers';
import {
  ValidationError,
  isValidateCancelSymbol,
  VALIDATION_ERROR_SYMBOL,
} from '../schemes';
import { Rule, RuleValidationOptions } from '../factories';
import { FN_RULE_DEFAULT_NAME, RULE_DEFAULT_MESSAGE } from '../constants';

/**
 * Validation options.
 */
export interface ValidationOptions {
  /**
   * Validate all rules.
   *
   * The validation function, by default, stops further rule validation if there is an error in one of them. Set it to `true` to validate all rules.
   */
  forceAll?: boolean;
  /**
   * Property name during object enumeration.
   *
   * This is typically not specified from the application and is intended for internal use.
   *
   * @internal
   */
  path?: string | number;
  /**
   * Prefix for the path during object enumeration.
   *
   * This is typically not specified from the application and is intended for internal use.
   *
   * @internal
   */
  eachPrefix?: string;
}

/**
 * Interface available for validation rule.
 */
export interface VerifiableRule
  extends Pick<Rule, 'validate' | 'message' | '$name'> {}

/**
 * Verifiable function type.
 *
 * - Treats it as an error if it returns `string` or `false`.
 * - If it returns `string`, it is considered as an error message.
 */
export type VerifiableFn = (
  value: any,
) =>
  | string
  | boolean
  | undefined
  | void
  | Promise<string | boolean | undefined | void>;

/**
 * Rule or function available for validation.
 */
export type VerifiableRuleOrFn = VerifiableRule | VerifiableFn;

/**
 * Create a validation interface from a function.
 *
 * @param fn - Verifiable function type.
 * @returns Interface available for validation rule.
 *
 * @see {@link VerifiableFn}
 * @see {@link VerifiableRule}
 */
export function verifiableFnToRule(fn: VerifiableFn): VerifiableRule {
  const $name = fn.name || FN_RULE_DEFAULT_NAME;

  let _lastMessage: string | undefined;

  const validate: Rule['validate'] = async (value) => {
    _lastMessage = undefined;
    const result = await fn(value);
    if (typeof result === 'string' || result === false) {
      const message = result || RULE_DEFAULT_MESSAGE;
      _lastMessage = message;
      const error: ValidationError = {
        $$symbol: VALIDATION_ERROR_SYMBOL,
        name: $name,
        message,
      };
      return error;
    }
  };

  const message: Rule['message'] = () => _lastMessage || 'error';

  return {
    $name,
    validate,
    message,
  };
}

/**
 * Normalize a function or interface for validation as an interface.
 *
 * @param source - Rule or function available for validation.
 * @returns Interface available for validation rule.
 */
export function resolveVerifiableRule<T extends VerifiableRuleOrFn>(
  source: T,
): T extends VerifiableRule ? T : VerifiableRule {
  if (
    typeof (source as VerifiableRule).$name === 'string' &&
    typeof (source as VerifiableRule).validate === 'function'
  ) {
    return source as any;
  }
  return verifiableFnToRule(source as VerifiableFn) as any;
}

/**
 * Validate the specified value against the specified rule or its recursive list.
 *
 * @param value - Value to be validated.
 * @param rules - Rule or its recursive list for validation.
 * @param options - Validation options.
 * @returns List of errors if validation fails.
 */
export async function validate(
  value: any,
  rules: RecursiveArray<VerifiableRule>,
  options: ValidationOptions = {},
): Promise<ValidationError[] | undefined> {
  const errors: ValidationError[] = [];
  const { forceAll, path, eachPrefix } = options;

  const _rules = flattenRecursiveArray(rules);

  const opts: RuleValidationOptions = { path, eachPrefix };

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
      $$symbol: VALIDATION_ERROR_SYMBOL,
      name,
      message,
      path,
      fullPath,
    });
  }
  return (errors.length && errors) || undefined;
}
