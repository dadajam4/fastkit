import {
  RawDeleteCacheRequest,
  RawGetCacheRequest,
  CreateCacheDetailsSettings,
  GetCacheRequest,
  DeleteCacheRequest,
  CacheControllerBehavior,
  CacheDetailsWithRemainingTimes,
} from './schemes';
import { clone } from '@fastkit/helpers';
import { Duration } from '@fastkit/duration';
import {
  createCacheDetails,
  toCacheDetailsWithRemainingTimes,
} from './helpers';

function resolveRawGetCacheRequest(raw: RawGetCacheRequest): GetCacheRequest {
  return typeof raw === 'string' ? { key: raw } : raw;
}

function resolveRawDeleteCacheRequest(
  raw: RawDeleteCacheRequest,
): DeleteCacheRequest {
  return typeof raw === 'string' ? { key: raw } : raw;
}

/**
 * Class that takes arbitrary storage and controls cache.
 */
export class CacheController<T = any> {
  readonly behavior: CacheControllerBehavior<T>;

  /**
   * Storage for cache operation.
   */
  get storage() {
    return this.behavior.storage;
  }

  /**
   * Duration until data is discarded.
   *
   * `number`(Seconds) or Duration instance.
   *
   * If you want the expiration date to be indefinite, set `-1`.
   */
  get ttl() {
    return this.behavior.ttl;
  }

  constructor(behavior: CacheControllerBehavior<T>) {
    this.behavior = behavior;
  }

  /**
   * Get the cache details.
   *
   * * If the cache does not exist or has expired, return `null`.
   * * If `allowExpired` is set to `true`, no expiration check is performed.
   *
   * @param req - Cache acquisition request or hash string.
   */
  async get(
    req: RawGetCacheRequest,
  ): Promise<CacheDetailsWithRemainingTimes<T> | null> {
    const _req = resolveRawGetCacheRequest(req);
    const _details = await this.storage.get(_req);

    if (!_details) return _details;

    const details = toCacheDetailsWithRemainingTimes(clone(_details));

    if (details.expired && !_req.allowExpired) {
      this.delete(req);
      return null;
    }

    return details;
  }

  /**
   * Stores the cache and returns the generated cache details.
   *
   * @param settings - Settings for cache creation.
   */
  async set(
    settings: Omit<CreateCacheDetailsSettings<T>, 'ttl'> & {
      /**
       * Duration until data is discarded.
       *
       * `number`(Seconds) or Duration instance.
       *
       * If you want the expiration date to be indefinite, set `Infinity` or a number less than 0.
       *
       * @default CacheController['ttl']
       */
      ttl?: number | Duration;
    },
  ) {
    const ttl = settings.ttl == null ? this.ttl : settings.ttl;

    const details = createCacheDetails({
      ...settings,
      ttl,
    });
    await this.storage.set(clone(details));
    return details;
  }

  /**
   * Delete the cache.
   *
   * * If no cache exists, nothing is done.
   *
   * @param req - Cache deletion request or hash string.
   */
  async delete(req: RawDeleteCacheRequest) {
    const _req = resolveRawDeleteCacheRequest(req);
    return this.storage.delete(_req);
  }
}

/**
 * Cache controller instance or its behavior settings.
 */
export type CacheControllerOrBehavior<T = any> =
  | CacheControllerBehavior<T>
  | CacheController<T>;

export function resolveCacheControllerOrBehavior<T = any>(
  raw: CacheControllerOrBehavior<T>,
): CacheController<T> {
  return raw instanceof CacheController ? raw : new CacheController(raw);
}
