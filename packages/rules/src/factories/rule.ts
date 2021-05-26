import {
  ValidateCancelSymbol,
  ValidationError,
  ValidationErrorSymbol,
} from '../schemes';
import { objectPathJoin } from '../utils';
import { RuleMessageService } from '../services';
import { isPromise } from '@fastkit/helpers';

export type RuleResult = Promise<
  void | typeof ValidateCancelSymbol | ValidationError
>;

export interface RuleValidateOptions {
  path?: string | number;
  eachPrefix?: string;
}

export type RuleSettingsValidateSource =
  /** When it passes verification */
  | true

  /** When verification fails */
  | false

  /** When the verification is considered successful and the subsequent verifications are skipped */
  | typeof ValidateCancelSymbol

  /** When there is a nested validation result object */
  | ValidationError[];

export type RuleSettingsValidatePayload =
  | RuleSettingsValidateSource
  | Promise<RuleSettingsValidateSource>;

export type RuleSettingsMessage<C extends any = any> =
  | string
  | ((value: any, ctx: RuleValidateContext<C>) => string);

export type RuleSettings<C extends any = any> =
  | {
      name: string;
      validate: (value: any, constraints: C) => RuleSettingsValidatePayload;
      message?: RuleSettingsMessage<C>;
      constraints: C;
    }
  | {
      name: string;
      validate: (value: any) => RuleSettingsValidatePayload;
      message?: RuleSettingsMessage<C>;
      constraints?: any;
    };

export interface RuleValidateContext<C extends any = any> {
  name: string;
  value: any;
  constraints: C;
  eachPrefix?: string;
  path?: string | number;
  fullPath?: string;
  message?: RuleSettingsMessage<C>;
  exception?: any;
}

export interface Rule<C extends any = any> {
  <EC extends C = C>(
    constraints: Partial<EC>,
    overRides?: string | Partial<RuleSettings<EC>>,
  ): Rule<EC>;
  $name: string;
  validate: (value: any, options?: RuleValidateOptions) => RuleResult;
  message: string | ((value: any, ctx: RuleValidateContext<C>) => string);
  constraints: C;
  _lastValidateOptions: RuleValidateOptions;
}

export function createRule<C extends any = any>(
  settings: RuleSettings<C>,
): Rule<C> {
  const { name, validate, message, constraints } = settings;

  function rule<EC extends C = C>(
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

  rule.$name = name;
  rule.message = message || '';
  rule.constraints = constraints;
  rule._lastValidateOptions = {} as RuleValidateOptions;

  rule.validate = async (value: any, options: RuleValidateOptions = {}) => {
    rule._lastValidateOptions = options;
    const { path, eachPrefix } = options;
    const fullPath = objectPathJoin(eachPrefix, path);

    const context = (): RuleValidateContext => {
      return {
        name,
        constraints,
        value,
        eachPrefix,
        path,
        fullPath,
        message,
      };
    };

    const baseError: Omit<ValidationError, 'message'> = {
      $$symbol: ValidationErrorSymbol,
      name,
      eachPrefix,
      path,
      fullPath,
      value,
    };

    try {
      let result = validate(value, constraints);
      if (isPromise(result)) result = await result;

      const children = Array.isArray(result) ? result : undefined;

      if (result === ValidateCancelSymbol) return ValidateCancelSymbol;
      if (!result || children) {
        const message =
          RuleMessageService.resolve(context()) ||
          'The input value is incorrect.';

        return {
          ...baseError,
          message,
          children,
        };
      }
    } catch (err) {
      const ctx = context();
      ctx.exception = err;
      const message =
        RuleMessageService.resolve(ctx) || 'An error has occurred.';

      return {
        ...baseError,
        message,
      };
    }
  };

  return rule;
}

export const rule = createRule;
