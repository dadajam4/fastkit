import { Duration } from '@fastkit/helpers';

/**
 * Cache Details.
 */
export interface CacheDetails<T = any> {
  /**
   * Cache Key.
   */
  key: string;

  /**
   * List of arguments when data is retrieved.
   */
  args?: any[];

  /**
   * Cached data.
   */
  data: T;

  /**
   * Cache creation date.
   *
   * * Date.prototype.toISOString()
   *
   * @example `"2022-10-05T14:48:00.000Z"`
   */
  createdAt: string;

  /**
   * Cash Expiration Date.
   *
   * * Date.prototype.toISOString()
   *
   * If a persistent cache, `null` is set.
   *
   * @example `"2022-10-05T14:48:00.000Z"`
   */
  expiredAt: string | null;
}

export interface CacheDetailsWithRemainingTimes<T = any>
  extends CacheDetails<T> {
  /**
   * Elapsed time since the cache was created.
   */
  elapsedTimes: Duration;

  /**
   * Time remaining until cache expiration date.
   *
   * If a persistent cache, `null` is set.
   */
  remainingTimes: Duration;

  /**
   * Indicates `true` if the expiration date has passed.
   */
  expired: boolean;
}

export function toCacheDetailsWithRemainingTimes<T = any>(
  source: CacheDetails<T>,
  now = Date.now(),
): CacheDetailsWithRemainingTimes<T> {
  const { createdAt, expiredAt } = source;
  const elapsedTimes = new Duration([createdAt, now]);
  const remainingTimesSource =
    expiredAt == null
      ? Infinity
      : Math.max(new Date(expiredAt).getTime() - now, 0);
  const remainingTimes = new Duration(remainingTimesSource);
  const expired = remainingTimes.milliseconds > 0;

  return {
    ...source,
    elapsedTimes,
    remainingTimes,
    expired,
  };
}

// /**
//  * キャッシュ
//  */
// export type CacheIncrementalHandler<T = any> = (
//   req: GetCacheRequest,
// ) => T | Promise<T>;

// export interface CacheIncrementalBehavior<T = any> {
//   handler: CacheIncrementalHandler<T>;
//   // revavalidateXXX?: number;
//   // unstable_revalidate
// }

/**
 * Cache acquisition request.
 */
export interface GetCacheRequest {
  /**
   * Cache Key.
   */
  key: string;

  /**
   * Set to `true` if expired data is acceptable.
   */
  allowExpired?: boolean;

  // incremental?: CacheIncrementalBehavior;
}

/**
 * Cache acquisition request or hash string.
 */
export type RawGetCacheRequest = string | GetCacheRequest;

/**
 * Cache deletion request.
 */
export interface DeleteCacheRequest {
  /**
   * Cache Key.
   */
  key: string;
}

/**
 * Cache deletion request or hash string.
 */
export type RawDeleteCacheRequest = string | DeleteCacheRequest;

/**
 * Storage for cache operation.
 */
export interface CacheStorage<T = any> {
  /**
   * Retrieve cache.
   *
   * @param req - Cache acquisition request.
   */
  get(
    req: GetCacheRequest,
  ): CacheDetails<T> | null | Promise<CacheDetails<T> | null>;

  /**
   * Save the cache.
   *
   * @param details - Cache Data Details
   */
  set(details: CacheDetails<T>): any;

  /**
   * Delete the cache.
   *
   * @param req - Cache deletion request.
   */
  delete(req: DeleteCacheRequest): any;

  /**
   * Clear storage.
   */
  clear(): any;
}

/**
 * Settings for cache creation.
 */
export interface CreateCacheDetailsSettings<T = any> {
  /**
   * Cache Key.
   */
  key: string;

  /**
   * Runtime argument list.
   */
  args?: any[];

  /**
   * Cached data.
   */
  data: T;

  /**
   * Duration until data is discarded.
   *
   * `number`(Seconds) or Duration instance.
   *
   * If you want the expiration date to be indefinite, set `-1`.
   */
  ttl: number | Duration;
}

/**
 * Cache Controller Behavior
 */
export interface CacheControllerBehavior<T = any> {
  /**
   * Storage for cache operation.
   */
  storage: CacheStorage<T>;

  /**
   * Duration until data is discarded.
   *
   * `number`(Seconds) or Duration instance.
   *
   * If you want the expiration date to be indefinite, set `-1`.
   */
  ttl: number | Duration;
}
