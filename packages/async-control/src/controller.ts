import { AsyncFn } from './schemes';
import { AsyncRequest } from './request';
import { tinyObjectHash } from '@fastkit/helpers';

export const ASYNC_CONTROLER_SYMBOL = Symbol();

/**
 * A function that wraps the original function.
 */
export type AsyncControlHandler<Fn extends AsyncFn> = Fn & {
  [ASYNC_CONTROLER_SYMBOL]: AsyncController<Fn>;
};

/**
 * Asynchronous processing controller.
 *
 * Concatenate consecutive processes for the same argument.
 *
 * @memo
 *   We plan to provide hook processing before and after execution of processes and cache functions, but these have not yet been implemented.
 */
export class AsyncController<Fn extends AsyncFn> {
  /**
   * Original function.
   */
  readonly originalFunc: Fn;

  /**
   * Function to which the `this` is bound.
   */
  readonly func: Fn;

  /**
   * A function that wraps the original function.
   */
  readonly handler: AsyncControlHandler<Fn>;

  /**
   * A map array of requests generated for each hash of the argument.
   */
  private _requestMap: Record<string, AsyncRequest<Fn>> = {};

  /**
   * Creates an asynchronous processing controller for the specified asynchronous processing.
   *
   * Concatenate consecutive processes for the same argument.
   *
   * @memo
   *   We plan to provide hook processing before and after execution of processes and cache functions, but these have not yet been implemented.
   *
   * @param func - Original function.
   * @param thisObj - The object you want to bind to the function `this`.
   */
  constructor(func: Fn, thisObj?: any) {
    this.originalFunc = func;
    func = func.bind(thisObj || this) as Fn;
    this.func = func;

    this.handler = ((...args) => {
      return new Promise((resolve, reject) => {
        const req = this.getRequestByArgs(args);
        req.push({ resolve, reject }, true);
      });
    }) as AsyncControlHandler<Fn>;

    this.handler[ASYNC_CONTROLER_SYMBOL] = this;
  }

  /**
   * Obtains the asynchronous processing request corresponding to the specified runtime argument list.
   *
   * @param args - Runtime argument list.
   */
  getRequestByArgs(args: any[]) {
    const { hash } = tinyObjectHash(args);

    let request = this._requestMap[hash];
    if (!request) {
      request = new AsyncRequest(this, hash, () => this.func(...args));
      this._requestMap[hash] = request;
    }
    return request;
  }

  /**
   * Deletes asynchronous processing requests.
   *
   * @param hash - Hash string of runtime argument list.
   */
  removeRequestByHash(hash: string) {
    delete this._requestMap[hash];
  }
}

/**
 * Retrieves Asynchronous processing controller from the specified asynchronous function.
 * If the controller is not found, an exception is thrown.
 *
 * @param func - function.
 */
export function getAsyncController<Fn extends AsyncFn>(func: Fn) {
  const controller = (func as AsyncControlHandler<Fn>)[ASYNC_CONTROLER_SYMBOL];
  if (!controller) {
    throw new Error('missing async controller.');
  }
  return controller;
}
