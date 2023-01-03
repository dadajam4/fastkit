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

export type RuleSettingsMessage<C = any> =
  | string
  | ((value: any, ctx: RuleValidateContext<C>) => string);

export type RuleSettings<C = any> =
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

export interface RuleValidateContext<C = any> {
  name: string;
  value: any;
  constraints: C;
  eachPrefix?: string;
  path?: string | number;
  fullPath?: string;
  message?: RuleSettingsMessage<C>;
  exception?: any;
}

export interface Rule<C = any> {
  <EC extends C = C>(
    constraints: Partial<EC>,
    overRides?: string | Partial<RuleSettings<EC>>,
  ): Rule<EC>;
  $name: string;
  validate: (value: any, options?: RuleValidateOptions) => RuleResult;
  message: string | ((value: any, ctx: RuleValidateContext<C>) => string);
  constraints: C;
  fork(settings: {
    name?: string;
    constraints?: C;
    message?: RuleSettingsMessage<C>;
  }): Rule<C>;
  _validate:
    | ((value: any, constraints: C) => RuleSettingsValidatePayload)
    | ((value: any) => RuleSettingsValidatePayload);
  _lastValidateOptions: RuleValidateOptions;
  toJSON(): {
    name: string;
    constraints: C;
  };
}

export function createRule<C = any>(settings: RuleSettings<C>): Rule<C> {
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
  rule._validate = validate;

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
