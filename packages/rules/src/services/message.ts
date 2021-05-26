import { RuleValidateContext } from '../';
import { RulesError } from '../logger';

export type RuleMessageResolver = (ctx: RuleValidateContext) => string | void;

export type RuleMessageResolverRemover = () => void;

export interface RuleMessageServiceDefault {
  validate: string | RuleMessageResolver;
  exception: string | RuleMessageResolver;
}

export class RuleMessageService {
  static defaults: RuleMessageServiceDefault = {
    validate: 'The input value is incorrect.',
    exception: (ctx) => {
      const exception = ctx.exception;
      const message =
        (exception && typeof exception === 'object' && exception.message) ||
        'An error has occurred.';
      const error =
        exception instanceof Error ? exception : new RulesError(message);
      if (console) {
        // eslint-disable-next-line no-console
        console.error && console.error(error);
        // eslint-disable-next-line no-console
        console.debug && console.debug(ctx);
      }
      return message;
    },
  };

  static resolveDefault(
    type: keyof RuleMessageServiceDefault,
    ctx: RuleValidateContext,
  ) {
    const resolver = this.defaults[type];
    if (typeof resolver === 'string') return resolver;
    return resolver(ctx);
  }

  static readonly resolvers: RuleMessageResolver[] = [];

  static addResolver(
    ...resolvers: RuleMessageResolver[]
  ): RuleMessageResolverRemover {
    for (const resolver of resolvers) {
      if (!this.resolvers.includes(resolver)) {
        this.resolvers.unshift(resolver);
      }
    }
    const remover = () => {
      for (const resolver of resolvers) {
        this.removeResolver(resolver);
      }
    };
    return remover;
  }

  static removeResolver(...resolvers: RuleMessageResolver[]) {
    for (const resolver of resolvers) {
      const index = this.resolvers.indexOf(resolver);
      if (index !== -1) {
        this.resolvers.splice(index, 1);
      }
    }
  }

  static resolve(ctx: RuleValidateContext) {
    let message: string | void;
    if (ctx.exception) {
      message = this.resolveDefault('exception', ctx);
      if (message !== undefined) return message;
    }
    for (const resolver of this.resolvers) {
      message = resolver(ctx);
      if (message !== undefined) return message;
    }
    const { message: ctxMessage } = ctx;
    if (ctxMessage) {
      if (typeof ctxMessage === 'function') {
        message = ctxMessage(ctx.value, ctx);
      } else {
        message = ctxMessage;
      }

      if (message !== undefined) return message;
    }
    return this.resolveDefault('validate', ctx);
  }
}
