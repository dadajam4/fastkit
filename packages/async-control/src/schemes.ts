import {
  CacheControllerBehavior,
  CacheController,
  CacheDetailsWithRemainingTimes,
} from '@fastkit/cache-control';
import { AwaitedReturnType } from '@fastkit/helpers';
import { Duration } from '@fastkit/duration';

/**
 * Some asynchronous function.
 */
export type AsyncFn<Args extends any[] = any[], Result = any> = (
  ...args: Args
) => Promise<Result>;

/**
 * Resolver for asynchronous processing (resolved & rejected).
 *
 * @internal
 */
export interface AsyncHandlerRequestResolver {
  resolve: (payload: any) => any;
  reject: (payload: any) => any;
}

/**
 * State of asynchronous processing.
 *
 * - `"pending"` The process has not yet begun.
 * - `"running"` in process.
 * - `"resolved"` resolved.
 * - `"rejected"` rejected.
 * - `"destroyed"` destroyed.
 */
export type AsyncHandlerRequestState =
  | 'pending'
  | 'running'
  | 'resolved'
  | 'rejected'
  | 'destroyed';

/**
 * A method to customize the argument list just before generating the hash.
 */
export type AsyncHandlerHashArgs<Fn extends AsyncFn> = (
  ...args: Parameters<Fn>
) => any;

/**
 * Error handler for cache operations.
 */
export type AsyncHandlerCacheErrorHandler = (error: unknown) => any;

/**
 * Map error handlers by cache operation method.
 */
export interface AsyncHandlerCacheErrorHandlerMap {
  /**
   * Error handler for cache acquisition.
   *
   * @default AsyncHandlerOptions.errorLogger
   */
  get: AsyncHandlerCacheErrorHandler;

  /**
   * Error handler when saving cache.
   *
   * @default AsyncHandlerOptions.errorLogger
   */
  set: AsyncHandlerCacheErrorHandler;
}

/**
 * Handler that determines whether or not the cache needs to be refreshed.
 */
export type AsyncHandlerCacheRevalidateChecker<T = any> = (
  details: CacheDetailsWithRemainingTimes<T>,
) => boolean;

/**
 * Cache Refresh Conditions.
 *
 * * `"always"` - Always trigger an update after cache acquisition.
 * * `number` - Number of valid seconds remaining in cache.
 * * `Duration` - Valid duration remaining in cache.
 * * `Function` - Handler that determines whether or not the cache needs to be refreshed.
 */
export type AsyncHandlerCacheRevalidateCondition<T = any> =
  | 'always'
  | number
  | Duration
  | AsyncHandlerCacheRevalidateChecker<T>;

/**
 * Cache controller behavior settings.
 */
export interface AsyncHandlerCacheBehavior<T = any>
  extends CacheControllerBehavior<T> {
  /**
   * Cache Refresh Conditions.
   * This setting will trigger a cache update in the background after the cache is acquired.
   *
   * * `"always"` - Always trigger an update after cache acquisition.
   * * `number` - Number of valid seconds remaining in cache.
   * * `Duration` - Valid duration remaining in cache.
   * * `Function` - Handler that determines whether or not the cache needs to be refreshed.
   */
  revalidate?: AsyncHandlerCacheRevalidateCondition;

  /**
   * Map error handlers by cache operation method.
   */
  errorHandlers?: Partial<AsyncHandlerCacheErrorHandlerMap>;
}

/**
 * Cache controllers and their operational settings.
 */
export interface AsyncHandlerCacheSettings<T = any> {
  /**
   * Class that takes arbitrary storage and controls cache.
   */
  controller: CacheController<T>;

  /**
   * Cache controller behavior settings.
   */
  behavior: AsyncHandlerCacheBehavior<T>;

  /**
   * Handler that determines whether or not the cache needs to be refreshed.
   */
  revalidate?: AsyncHandlerCacheRevalidateChecker<T>;

  /**
   * Map error handlers by cache operation method.
   */
  errorHandlers: AsyncHandlerCacheErrorHandlerMap;
}

/**
 * Cache controller instance or its behavior settings.
 */
export type RawAsyncHandlerCacheBehavior<T = any> =
  | AsyncHandlerCacheBehavior<T>
  | CacheController<T>;

/**
 * Error logger for AsyncHandler.
 */
export type AsyncHandlerErrorLogger = (error: unknown) => any;

/**
 * Configure behavior when incorporating this asynchronous support into a function.
 */
export interface AsyncHandlerOptions<Fn extends AsyncFn> {
  /**
   * Error logger for AsyncHandler.
   *
   * @default console.error
   */
  errorLogger?: AsyncHandlerErrorLogger;

  /**
   * You may want to bind the `this` to a function controlled by this asynchronous support.
   */
  thisObj?: any;

  /**
   * Set the time in milliseconds to allow for a delay before starting the asynchronous process.
   *
   * @default 0 Immediately Execute.
   */
  delay?: number;

  /**
   * A method to customize the argument list just before generating the hash.
   */
  hashArgs?: AsyncHandlerHashArgs<Fn>;

  /**
   * Cache controller instance or its behavior settings.
   *
   * Set this option if you want to use cache control together.
   */
  cache?: RawAsyncHandlerCacheBehavior<AwaitedReturnType<Fn>>;

  /**
   * Enable/disable asynchronous control. Asynchronous control works only if it resolves as `true`.
   *
   * @default true
   */
  enabled?: boolean | ((...args: Parameters<Fn>) => boolean);
}
