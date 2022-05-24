/**
 * Some asynchronous function.
 */
export type AsyncFn<Result = any> = (...args: any[]) => Promise<Result>;

/**
 * Resolver for asynchronous processing (resolved & rejected).
 *
 * @internal
 */
export interface AsyncRequestResolver {
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
 */
export type AsyncRequestState = 'pending' | 'running' | 'resolved' | 'rejected';

/**
 * Cache Data Details
 */
export interface CacheDetails<T = any> {
  /**
   * Hash string of runtime argument list.
   */
  hash: string;

  /**
   * Runtime argument list.
   */
  args: any[];

  /**
   * cached data.
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
   * @example `"2022-10-05T14:48:00.000Z"`
   */
  expiredAt: string;

  /**
   * Indicates `true` if the expiration date has passed.
   */
  expired?: boolean;
}

/**
 * Cache acquisition request.
 */
export interface GetCacheRequest {
  /**
   * Hash string of runtime argument list.
   */
  hash: string;

  /**
   * Set to `true` if expired data is acceptable.
   */
  allowExpired?: boolean;
}

/**
 * Cache acquisition request or hash string.
 */
export type RawGetCacheRequest = string | GetCacheRequest;

export function resolveRawGetCacheRequest(
  raw: RawGetCacheRequest,
): GetCacheRequest {
  return typeof raw === 'string' ? { hash: raw } : raw;
}

/**
 * Cache deletion request.
 */
export interface DeleteCacheRequest {
  /**
   * Hash string of runtime argument list.
   */
  hash: string;
}

/**
 * Cache deletion request or hash string.
 */
export type RawDeleteCacheRequest = string | DeleteCacheRequest;

export function resolveRawDeleteCacheRequest(
  raw: RawDeleteCacheRequest,
): DeleteCacheRequest {
  return typeof raw === 'string' ? { hash: raw } : raw;
}

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
  put(details: CacheDetails<T>): any;

  /**
   * Delete the cache.
   *
   * @param req - Cache deletion request.
   */
  delete(req: DeleteCacheRequest): any;
}
