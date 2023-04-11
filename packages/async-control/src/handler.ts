import {
  AsyncFn,
  AsyncHandlerOptions,
  AsyncHandlerHashArgs,
  AsyncHandlerCacheSettings,
  AsyncHandlerErrorLogger,
} from './schemes';
import { resolveRawAsyncHandlerCacheBehavior } from './helpers';
import { AsyncHandlerRequest } from './request';
import { AwaitedReturnType } from '@fastkit/helpers';
import { tinyObjectHash } from '@fastkit/tiny-hash';

/**
 * Asynchronous processing controller.
 *
 * Concatenate consecutive processes for the same argument.
 *
 * @memo
 *   We plan to provide hook processing before and after execution of processes and cache functions, but these have not yet been implemented.
 */
export class AsyncHandler<Fn extends AsyncFn> {
  /**
   * Original function.
   */
  originalFunc: Fn;

  /**
   * The `this` object to bind to the original function.
   */
  thisObj?: any;

  /**
   * Error logger for AsyncHandler.
   *
   * @default console.error
   */
  readonly errorLogger: AsyncHandlerErrorLogger;

  /**
   * A function that wraps the original function.
   */
  readonly handler: Fn;

  /**
   * A map array of requests generated for each hash of the argument.
   */
  private _requestMap: Record<string, AsyncHandlerRequest<Fn>> = {};

  /**
   * Delay time (in milliseconds) to start asynchronous processing.
   */
  readonly delay: number;

  /**
   * Cache controllers and their operational settings.
   */
  readonly cache?: AsyncHandlerCacheSettings<AwaitedReturnType<Fn>>;

  /**
   * A method to customize the argument list just before generating the hash.
   */
  readonly hashArgs?: AsyncHandlerHashArgs<Fn>;

  /**
   * Enable/disable asynchronous control. Asynchronous control works only if it resolves as `true`.
   *
   * @default true
   */
  readonly enabled: boolean | ((...args: Parameters<Fn>) => boolean);

  /**
   * Creates an asynchronous processing controller for the specified asynchronous processing.
   *
   * Concatenate consecutive processes for the same argument.
   *
   * @memo
   *   We plan to provide hook processing before and after execution of processes and cache functions, but these have not yet been implemented.
   *
   * @param func - Original function.
   * @param options - Configure behavior when incorporating this asynchronous support into a function.
   */
  constructor(func: Fn, options: AsyncHandlerOptions<Fn> = {}) {
    const {
      errorLogger,
      thisObj,
      cache,
      delay = 0,
      hashArgs,
      enabled = true,
    } = options;

    this.errorLogger = errorLogger || console.error;
    this.originalFunc = func;
    this.thisObj = thisObj;
    this.hashArgs = hashArgs;
    this.enabled = enabled;

    if (cache) {
      this.cache = resolveRawAsyncHandlerCacheBehavior(cache, this);
    }

    this.delay = delay;

    this.handler = ((...args: Parameters<Fn>) => {
      if (!this.isEnabled(...args)) {
        return this.call(...args);
      }
      return new Promise((resolve, reject) => {
        const req = this.getRequestByArgs(args);
        req.push({ resolve, reject });
      });
    }) as Fn;
  }

  /**
   * Returns true if the specified runtime argument is the target of asynchronous control execution.
   *
   * @param args - Runtime argument list.
   */
  isEnabled(...args: Parameters<Fn>): boolean {
    const { enabled } = this;
    return typeof enabled === 'boolean' ? enabled : enabled(...args);
  }

  /**
   * Calls the original method.
   *
   * @param args - Argument list for executing the original method.
   */
  call(...args: Parameters<Fn>): Promise<Awaited<ReturnType<Fn>>> {
    const { originalFunc } = this;
    if (!originalFunc) {
      throw new Error('missing function.');
    }
    return originalFunc.apply(this.thisObj || this, args);
  }

  /**
   * Obtains the asynchronous processing request corresponding to the specified runtime argument list.
   *
   * @param args - Runtime argument list.
   */
  getRequestByArgs(args: Parameters<Fn>) {
    const { hashArgs } = this;
    const hashSource = hashArgs ? hashArgs(...args) : args;
    const { hash } = tinyObjectHash(hashSource);

    let request = this._requestMap[hash];
    if (!request) {
      request = new AsyncHandlerRequest(this, args, hash, () => {
        this.removeRequestByHash(hash);
      });
      this._requestMap[hash] = request;
    }
    return request;
  }

  /**
   * Deletes asynchronous processing requests.
   *
   * @param hash - Hash string of runtime argument list.
   */
  private removeRequestByHash(hash: string) {
    delete this._requestMap[hash];
  }
}
