export function createTinyError(name: string) {
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
    get _tiny_error_symbol() {
      return TINY_ERROR_SYMBOL;
    }

    constructor(message: string | Error) {
      super(resolveMessage(message));
    }
  };
}
