/**
 * An error created by {@link createTinyError}.
 */
export interface TinyError extends Error {
  readonly _tiny_error_symbol: symbol;
}

/**
 * The class {@link createTinyError} returns.
 *
 * @remarks
 * Declared rather than inferred. The returned class extends `Error`, so its
 * inferred type carries `Error`'s static side -- which `@types/node` augments
 * with `prepareStackTrace(err, stackTraces: NodeJS.CallSite[])`. Emitting that
 * expansion put `NodeJS.CallSite` in the published declarations of a package
 * that has no business requiring Node's types (issue #240).
 */
export interface TinyErrorConstructor {
  new (message: string | Error): TinyError;
}

export function createTinyError(name: string): TinyErrorConstructor {
  const TINY_ERROR_SYMBOL = Symbol('TinyError');

  function resolveMessage(message: string | Error) {
    if (message && typeof message === 'object' && 'message' in message) {
      if ((message as any)._tiny_error_symbol === TINY_ERROR_SYMBOL) {
        return message.message;
      }
      message = message.message;
    }
    return `[${name}] ${message}`;
  }

  return class TinyError extends Error {
    readonly _tiny_error_symbol: symbol;

    constructor(message: string | Error) {
      super(resolveMessage(message));
      this._tiny_error_symbol = TINY_ERROR_SYMBOL;
    }
  };
}
