import {
  CacheDetails,
  CacheStorage,
  DeleteCacheRequest,
  GetCacheRequest,
} from '../schemes';
import { Duration } from '@fastkit/duration';

const DEFAULT_MAX_KEYS = 32767;

/**
 * @see https://developer.mozilla.org/docs/Web/API/setTimeout#maximum_delay_value
 */
const DEFAULT_MAX_TIMEOUT = 2147483647;

/**
 * Options for Memory based storage.
 */
export interface MemoryCacheStorageOptions {
  /**
   * Maximum number of caches to be kept in storage.
   *
   * @default 32767
   */
  maxKeys?: number;

  /**
   * Maximum TTL(Time to Live) of cache data. (millisecond)
   *
   * @default 2147483647
   */
  maxTimeout?: number;
}

/**
 * Cache storage by memory.
 */
export class MemoryCacheStorage implements CacheStorage {
  private _bucket = new Map<string, CacheDetails<any>>();

  /**
   * Maximum number of caches to be kept in storage.
   *
   * @default 32767
   */
  maxKeys: number;

  /**
   * Maximum TTL(Time to Live) of cache data. (millisecond)
   *
   * @default 2147483647
   */
  maxTimeout: number;

  constructor(options: MemoryCacheStorageOptions = {}) {
    const { maxKeys = DEFAULT_MAX_KEYS, maxTimeout = DEFAULT_MAX_TIMEOUT } =
      options;

    this.maxKeys = maxKeys;
    this.maxTimeout = Math.min(maxTimeout, DEFAULT_MAX_TIMEOUT);
  }

  private _roundByMaxKeys() {
    const keys = Array.from(this._bucket.keys());
    const overflowLength = keys.length - this.maxKeys;

    if (overflowLength < 1) return;

    keys.length = overflowLength;

    for (const key of keys) {
      this.delete({ key });
    }
  }

  get(
    req: GetCacheRequest,
  ): CacheDetails<any> | Promise<CacheDetails<any> | null> | null {
    return this._bucket.get(req.key) || null;
  }

  set(details: CacheDetails<any>) {
    this._bucket.set(details.key, details);
    this._roundByMaxKeys();

    const { createdAt, expiredAt } = details;

    if (!expiredAt) return;

    const duration = new Duration([createdAt, expiredAt]).milliseconds;

    const timeout = Math.min(duration, this.maxTimeout);

    setTimeout(() => this.delete(details), timeout);
  }

  delete(req: DeleteCacheRequest) {
    this._bucket.delete(req.key);
  }

  clear() {
    this._bucket.clear();
  }

  get size() {
    return this._bucket.size;
  }

  keys() {
    return this._bucket.keys();
  }
}
