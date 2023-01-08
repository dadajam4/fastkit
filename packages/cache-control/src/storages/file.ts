import {
  CacheDetails,
  CacheStorage,
  DeleteCacheRequest,
  GetCacheRequest,
} from '../schemes';
import { Duration } from '@fastkit/duration';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @see https://developer.mozilla.org/docs/Web/API/setTimeout#maximum_delay_value
 */
const DEFAULT_MAX_TIMEOUT = 2147483647;

function resolveDir(source: string) {
  return path.isAbsolute(source) ? source : path.resolve(source);
}

function ensureDir(dir: string) {
  return new Promise<void>((resolve, reject) => {
    fs.mkdir(dir, (err) => {
      if (!err) return resolve();
      const parentDir = path.dirname(dir);
      if (!parentDir || parentDir === dir) {
        throw new Error(`directory cannot be created. "${dir}"`);
      }
      ensureDir(parentDir)
        .then(() => ensureDir(dir))
        .then(resolve)
        .catch(reject);
    });
  });
}

/**
 * Options for Memory based storage.
 */
export interface FileCacheStorageOptions {
  /**
   * Directory to store cache files.
   *
   * If a relative path is specified, the prefix of the current directory(`process.cwd()`) is automatically assigned.
   */
  dir: string;

  /**
   * Maximum TTL(Time to Live) of cache data. (millisecond)
   *
   * @default 2147483647
   */
  maxTimeout?: number;
}

/**
 * Cache storage by file system.
 */
export class FileCacheStorage implements CacheStorage {
  /**
   * Directory to store cache files.
   */
  dir: string;

  /**
   * Maximum TTL(Time to Live) of cache data. (millisecond)
   *
   * @default 2147483647
   */
  maxTimeout: number;

  constructor(options: FileCacheStorageOptions) {
    const { dir, maxTimeout = DEFAULT_MAX_TIMEOUT } = options;

    this.dir = resolveDir(dir);
    this.maxTimeout = Math.min(maxTimeout, DEFAULT_MAX_TIMEOUT);
  }

  createFilePath(key: string) {
    return path.join(this.dir, `${key}.json`);
  }

  get(
    req: GetCacheRequest,
  ): CacheDetails<any> | Promise<CacheDetails<any> | null> | null {
    return new Promise((resolve, reject) => {
      fs.readFile(this.createFilePath(req.key), 'utf-8', (err, data) => {
        if (err) {
          return err.code === 'ENOENT' ? resolve(null) : reject(err);
        }
        resolve(JSON.parse(data));
      });
    });
  }

  set(details: CacheDetails<any>) {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(
        this.createFilePath(details.key),
        JSON.stringify(details),
        (err) => {
          if (err) {
            if (err.code === 'ENOENT') {
              return ensureDir(this.dir)
                .then(() => this.set(details))
                .then(resolve)
                .catch(reject);
            }
            return reject(err);
          }

          resolve();

          const { createdAt, expiredAt } = details;

          if (!expiredAt) return;

          const duration = new Duration([createdAt, expiredAt]).milliseconds;

          const timeout = Math.min(duration, this.maxTimeout);

          setTimeout(() => this.delete(details), timeout);
        },
      );
    });
  }

  delete(req: DeleteCacheRequest) {
    return new Promise<void>((resolve, reject) => {
      fs.unlink(this.createFilePath(req.key), (err) => {
        if (!err || err.code === 'ENOENT') return resolve();
        reject(err);
      });
    });
  }

  clear() {
    return new Promise<void>((resolve, reject) => {
      fs.rm(this.dir, { recursive: true }, (err) => {
        if (!err || err.code === 'ENOENT') return resolve();
        reject(err);
      });
    });
  }
}
