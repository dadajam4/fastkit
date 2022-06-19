import {
  AsyncHandlerRequestResolver,
  AsyncHandlerRequestState,
  AsyncFn,
} from './schemes';
import type { AsyncHandler } from './handler';
import { clone, arrayRemove } from '@fastkit/helpers';
import { CacheDetailsWithRemainingTimes } from '@fastkit/cache-control';

/**
 * Asynchronous processing request.
 */
export class AsyncHandlerRequest<Fn extends AsyncFn> {
  /**
   * Parent controller.
   */
  readonly controller: AsyncHandler<Fn>;

  /**
   * Runtime argument list.
   */
  readonly args: Parameters<Fn>;

  /**
   * Hash string of runtime argument list.
   */
  readonly hash: string;

  /**
   * List of resolvers for asynchronous processing.
   */
  readonly resolvers: AsyncHandlerRequestResolver[] = [];

  /**
   * State of asynchronous processing.
   */
  private _state: AsyncHandlerRequestState = 'pending';

  /**
   * Resolved value object.
   */
  private _resolvedPayload?: {
    value: Awaited<ReturnType<Fn>>;
  };

  private _finisher?: () => void;

  /**
   * State of asynchronous processing.
   */
  get state() {
    return this._state;
  }

  /**
   * Indicates `true` when the process has not yet started.
   */
  get isPending() {
    return this.state === 'pending';
  }

  /**
   * Indicates `true` if processing is in progress.
   */
  get isRunning() {
    return this.state === 'running';
  }

  /**
   * Indicates `true` if the problem has been resolved.
   */
  get isResolved() {
    return this.state === 'resolved';
  }

  /**
   * Indicates `true` if rejected.
   */
  get isRejected() {
    return this.state === 'rejected';
  }

  get isDestroyed() {
    return this.state === 'destroyed';
  }

  /**
   * Delay time (in milliseconds) to start asynchronous processing.
   */
  get delay() {
    return this.controller.delay;
  }

  /**
   * Class that takes arbitrary storage and controls cache.
   */
  get cache() {
    return this.controller.cache;
  }

  /**
   * Error logger for AsyncHandler.
   */
  get errorLogger() {
    return this.controller.errorLogger;
  }

  /**
   * Resolved value object.
   */
  get resolvedPayload() {
    return this._resolvedPayload;
  }

  /**
   * @param controller - Parent controller.
   * @param args - Runtime argument list.
   * @param hash - Hash string of runtime argument list.
   */
  constructor(
    controller: AsyncHandler<Fn>,
    args: Parameters<Fn>,
    hash: string,
    finisher: () => void,
  ) {
    this.controller = controller;
    this.args = clone(args);
    this.hash = hash;
    this._finisher = finisher;
  }

  getResolvedValue() {
    const { _resolvedPayload } = this;
    if (!_resolvedPayload) {
      throw new Error('No values resolved yet.');
    }
    return _resolvedPayload.value;
  }

  /**
   * Adding a Resolver.
   *
   * @param resolver - Resolver for asynchronous processing (resolved & rejected).
   */
  push(resolver: AsyncHandlerRequestResolver) {
    this.resolvers.push(resolver);

    if (this.isPending) {
      this.run();
      return;
    }

    if (this.isResolved) {
      // If already resolved, resolve with the value held immediately.
      return this.resolve('resolve');
    }

    if (this.isRejected) {
      // If already rejected, skip data retrieval and reject immediately.
      return this.resolve('reject', new Error('Process was already rejected.'));
    }

    if (this.isDestroyed) {
      // If the instance has already been destroyed, reject it immediately.
      return this.resolve(
        'reject',
        new Error('Process was already destroyed.'),
      );
    }
  }

  /**
   * If the parent controller has a delay set, it returns a Promise instance that will wait for that amount of time.
   */
  runDelay() {
    const { delay } = this;
    if (!delay) return Promise.resolve();
    return new Promise<void>((resolve) => {
      setTimeout(resolve, delay);
    });
  }

  /**
   * Start processing
   *
   * If processing has already started, nothing is done.
   */
  async run() {
    if (!this.isPending) return;

    this._state = 'running';

    try {
      // Prepare variable references and temporary variables.
      const { cache } = this;

      /**
       * result variable.
       */
      let payload: Awaited<ReturnType<Fn>>;

      /**
       * Details of acquired cache.
       *
       * * `null` - Attempted to retrieve the cache, but the cache did not exist.
       * * `undefined` - Cache was not set up, so cache retrieval was skipped.
       */
      let cacheDetails:
        | CacheDetailsWithRemainingTimes<Awaited<ReturnType<Fn>>>
        | null
        | undefined;

      /**
       * Promise to indicate completion of asynchronous finishing process.
       *
       * * When a cache is used, for example, the cache storage promise is substituted.
       * * This empty promise is always used, even when caching is not used. This is because we want to divert the executed result when asynchronous processing is called synchronously in succession.
       */
      let finishPromise: Promise<any> = Promise.resolve();

      // 1. Wait for the time of the delay value that may have been set.
      await this.runDelay();

      // 2. Retrieve cache data if cache is configured.
      if (cache) {
        cacheDetails = await cache.controller.get(this.hash).catch((err) => {
          cache.errorHandlers.get(err);
          return null;
        });
      }

      // 3. Set the result variable to a value.
      if (cacheDetails) {
        // 3.a. If a cache is available, the value is used.
        payload = cacheDetails.data;

        if (cache && cache.revalidate && cache.revalidate(cacheDetails)) {
          // Triggering background updates of the cache.
          finishPromise = this.controller
            .call(...this.args)
            .then((newData) => {
              cache.controller.set({
                key: this.hash,
                args: this.args,
                data: newData,
              });
            })
            .catch((err) => {
              cache.errorHandlers.set(err);
              return null;
            });
        }
      } else {
        // 3.b. If there was no cache, retrieve the data.
        payload = await this.controller.call(...this.args);

        if (cache) {
          // If cache settings have been made, the acquired data is saved as a cache.
          finishPromise = cache.controller
            .set({
              key: this.hash,
              args: this.args,
              data: payload,
            })
            .catch((err) => {
              cache.errorHandlers.set(err);
              return null;
            });
        }
      }

      // 4. Keep the resolved value.
      this._resolvedPayload = { value: payload };

      this.resolve('resolve');
      await finishPromise
        .catch(() => null)
        .finally(() => {
          this.destroy();
        });
    } catch (err) {
      this.resolve('reject', err);
      this.destroy();
    }
  }

  /**
   * Resolve all resolvers
   *
   * @param type - Resolve or Reject.
   * @param payload - Execution Result
   */
  resolve(type: 'resolve' | 'reject', error?: any) {
    this._state = type === 'resolve' ? 'resolved' : 'rejected';

    const resolvers = this.resolvers.slice();

    const getPayload = () => {
      if (type === 'reject') return error;
      const payload = this.getResolvedValue();
      if (resolvers.length < 2 || !payload || typeof payload !== 'object') {
        return payload;
      }
      return clone(payload);
    };

    for (const resolver of resolvers) {
      try {
        resolver[type](getPayload());
      } catch (err) {
        this.errorLogger(err);
      }
      arrayRemove(this.resolvers, resolver);
    }
  }

  private _dispose() {
    if (this._finisher) {
      this._finisher();
      delete this._finisher;
    }
  }

  destroy() {
    if (this.isDestroyed) return;

    this._dispose();

    delete this._resolvedPayload;

    this._state = 'destroyed';
  }
}
