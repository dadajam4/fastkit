import { isPromise } from '@fastkit/helpers';
import {
  VALIDATE_CANCEL_SYMBOL,
  ValidationError,
  VALIDATION_ERROR_SYMBOL,
} from '../schemes';
import { objectPathJoin } from '../utils';
import { RuleMessageService } from '../services';
import { RULE_DEFAULT_NAME, RULE_DEFAULT_MESSAGE } from '../constants';

/**
 * Execution result of the rule.
 */
export type RuleResult = Promise<
  void | typeof VALIDATE_CANCEL_SYMBOL | ValidationError
>;

/**
 * Validation options for the rule.
 */
export interface RuleValidationOptions {
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
 * Result of rule validation.
 */
export type RuleValidationResultValue =
  /** When it passes verification */
  | true

  /** When verification fails */
  | false

  /** When the verification is considered successful and the subsequent verifications are skipped */
  | typeof VALIDATE_CANCEL_SYMBOL

  /** When there is a nested validation result object */
  | ValidationError[];

/**
 * Result of rule validation or its Promise instance.
 */
export type RuleValidationResult =
  | RuleValidationResultValue
  | Promise<RuleValidationResultValue>;

/**
 * Message specification for the rule.
 */
export type RuleMessageSpec<C = any> =
  | string
  | ((value: any, ctx: RuleValidateContext<C>) => string);

/** Basic settings for the rule. */
export interface RuleBasicSettings<C = any> {
  /** Rule name. */
  name: string;
  /**
   * Message specification for the rule.
   *
   * @see {@link RuleMessageSpec}
   */
  message?: RuleMessageSpec<C>;
}

/**
 * Rule settings.
 */
export type RuleSettings<C = any> =
  | (RuleBasicSettings<C> & {
      /**
       * Validation function.
       *
       * @param value - Value to be validated.
       * @param constraints - Constraints.
       * @returns Result of rule validation or its Promise instance.
       */
      validate: (value: any, constraints: C) => RuleValidationResult;
      /**
       * Constraints.
       *
       * Passed as the second argument to the validation function, this value can be customized through rule forking.
       */
      constraints: C;
    })
  | (RuleBasicSettings<C> & {
      /**
       * Validation function.
       *
       * @param value - Value to be validated.
       * @returns Result of rule validation or its Promise instance.
       */
      validate: (value: any) => RuleValidationResult;
      constraints?: any;
    });

/**
 * Context object for rule validation.
 */
export interface RuleValidateContext<C = any> {
  /** Rule name. */
  name: string;
  /** Value to be validated. */
  value: any;
  /** Constraints. */
  constraints: C;
  /** Prefix for the path during object enumeration. */
  eachPrefix?: string;
  /** Property name during object enumeration. */
  path?: string | number;
  /** Full path to the property during object enumeration. */
  fullPath?: string;
  /**
   * Message specification for the rule.
   *
   * @see {@link RuleMessageSpec}
   */
  message?: RuleMessageSpec<C>;
  /** Exception that occurred during rule validation. */
  exception?: any;
}

/**
 * Fork settings for the rule.
 */
export interface RuleForkSettings<C = any> {
  /** New rule name. */
  name?: string;
  /** New constraints. */
  constraints?: C;
  /**
   * New message specification.
   *
   * @see {@link RuleMessageSpec}
   */
  message?: RuleMessageSpec<C>;
}

/**
 * Rule interface.
 */
export interface Rule<C = any> {
  <EC extends C = C>(
    constraints: Partial<EC>,
    overRides?: string | Partial<RuleSettings<EC>>,
  ): Rule<EC>;
  /** Rule name. */
  $name: string;
  /**
   * Validate the specified value.
   *
   * @param value - Value to be validated.
   * @param options Validation options for the rule.
   * @returns Execution result of the rule.
   */
  validate: (value: any, options?: RuleValidationOptions) => RuleResult;
  /**
   * Message specification for the rule.
   *
   * @see {@link RuleMessageSpec}
   */
  message: RuleMessageSpec<C>;
  /**
   * Constraints.
   *
   * Passed as the second argument to the validation function, this value can be customized through rule forking.
   */
  constraints: C;
  /**
   * Fork this rule to create a new rule.
   *
   * Used when creating a new rule with customized name, constraints, and message specifications.
   *
   * @param settings - RuleForkSettings
   */
  fork(settings: RuleForkSettings): Rule<C>;
  /**
   * Validation function.
   *
   * @internal
   */
  _validate:
    | ((value: any, constraints: C) => RuleValidationResult)
    | ((value: any) => RuleValidationResult);
  /**
   * Options used in the most recent validation.
   *
   * @see {@link RuleValidationOptions}
   */
  _lastValidationOptions: RuleValidationOptions;
  /**
   * Retrieve the rule as JSON.
   */
  toJSON(): {
    /** Rule name. */
    name: string;
    /** Constraints. */
    constraints: C;
  };
}

/**
 * Create a rule.
 *
 * @param settings - Rule settings.
 * @returns Rule interface.
 *
 * @see {@link RuleSettings}
 */
export function createRule<C = any>(settings: RuleSettings<C>): Rule<C> {
  const { name, validate, message, constraints } = settings;

  function rule<EC extends C = C>(
    // eslint-disable-next-line no-shadow
    constraints: Partial<EC>,
    overRides?: string | Partial<RuleSettings<EC>>,
  ): Rule<EC> {
    if (typeof overRides === 'string') {
      overRides = {
        name: overRides,
      };
    }

    let _constraints = rule.constraints;
    if (
      _constraints &&
      typeof _constraints === 'object' &&
      constraints &&
      typeof constraints === 'object'
    ) {
      _constraints = {
        ..._constraints,
        ...constraints,
      };
    } else {
      _constraints = constraints;
    }
    return createRule({
      ...(settings as RuleSettings<EC>),
      constraints: _constraints,
      ...overRides,
    });
  }

  rule.$name = name || RULE_DEFAULT_NAME;
  rule.message = message || '';
  rule.constraints = constraints;
  rule._lastValidationOptions = {} as RuleValidationOptions;
  rule._validate = validate;

  rule.validate = async (value: any, options: RuleValidationOptions = {}) => {
    rule._lastValidationOptions = options;
    const { path, eachPrefix } = options;
    const fullPath = objectPathJoin(eachPrefix, path);

    const context = (): RuleValidateContext => ({
      name,
      constraints,
      value,
      eachPrefix,
      path,
      fullPath,
      message,
    });

    const baseError: Omit<ValidationError, 'message'> = {
      $$symbol: VALIDATION_ERROR_SYMBOL,
      name,
      eachPrefix,
      path,
      fullPath,
      value,
      constraints,
    };

    try {
      let result = validate(value, constraints);
      if (isPromise(result)) result = await result;

      const children = Array.isArray(result) ? result : undefined;

      if (result === VALIDATE_CANCEL_SYMBOL) return VALIDATE_CANCEL_SYMBOL;
      if (!result || children) {
        // eslint-disable-next-line no-shadow
        const message =
          RuleMessageService.resolve(context()) || RULE_DEFAULT_MESSAGE;

        return {
          ...baseError,
          message,
          children,
        };
      }
    } catch (err) {
      const ctx = context();
      ctx.exception = err;
      // eslint-disable-next-line no-shadow
      const message =
        RuleMessageService.resolve(ctx) || 'An error has occurred.';

      return {
        ...baseError,
        message,
      };
    }
  };

  // eslint-disable-next-line no-shadow
  rule.fork = function fork(settings: {
    name?: string;
    constraints?: C;
    message?: string | ((value: any, ctx: RuleValidateContext<C>) => string);
  }) {
    return createRule({
      name: settings.name || rule.$name,
      constraints: settings.constraints || rule.constraints,
      validate: rule._validate,
      message: settings.message || rule.message,
    });
  };

  rule.toJSON = function toJSON() {
    return {
      name: rule.$name,
      constraints: rule.constraints,
    };
  };

  return rule;
}

export const rule = createRule;
