// export class CacheControl {}
import {
  CacheDetails,
  CacheStorage,
  DeleteCacheRequest,
  RawDeleteCacheRequest,
  resolveRawDeleteCacheRequest,
  GetCacheRequest,
  RawGetCacheRequest,
  resolveRawGetCacheRequest,
} from './schemes';

/**
 * Cache storage by memory.
 */
export class MemCacheStorage implements CacheStorage {
  private _bucket = new Map<string, CacheDetails<any>>();

  get(
    req: GetCacheRequest,
  ): CacheDetails<any> | Promise<CacheDetails<any> | null> | null {
    return this._bucket.get(req.hash) || null;
  }

  put(details: CacheDetails<any>) {
    this._bucket.set(details.hash, details);
  }

  delete(req: DeleteCacheRequest) {
    this._bucket.delete(req.hash);
  }
}

export interface CreateCacheDetailsSettings<T = any> {
  hash: string;
  args: any[];
  data: T;
  ttl: number;
}

function createCacheDetails<T = any>(
  settings: CreateCacheDetailsSettings<T>,
): CacheDetails<T> {
  const { hash, args, data, ttl } = settings;
  const createdAtDt = new Date();
  const expiredAtDt = new Date(createdAtDt.getTime() + ttl * 1000);

  return {
    hash,
    args,
    data,
    createdAt: createdAtDt.toISOString(),
    expiredAt: expiredAtDt.toISOString(),
  };
}

export class CacheController<T = any> {
  readonly storage: CacheStorage<T>;

  constructor(storage: CacheStorage<T>) {
    this.storage = storage;
  }

  async get(req: RawGetCacheRequest) {
    const _req = resolveRawGetCacheRequest(req);
    const details = await this.storage.get(_req);

    if (!details) return details;

    details.expired = Date.now() > new Date(details.expiredAt).getTime();

    if (details.expired && !_req.allowExpired) {
      this.delete(req);
      return null;
    }

    return details;
  }

  async put(settings: CreateCacheDetailsSettings<T>) {
    const details = createCacheDetails(settings);
    await this.storage.put(details);
    return details;
  }

  async delete(req: RawDeleteCacheRequest) {
    const _req = resolveRawDeleteCacheRequest(req);
    return this.storage.delete(_req);
  }
}
