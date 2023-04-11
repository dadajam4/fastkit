import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FileCacheStorage } from '../file';
import { CacheDetails } from '../../schemes';
import path from 'node:path';
import fs from 'fs-extra';

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function createDetails(settings: {
  key: string;
  args?: any;
  data?: any;
  ttl: number | null;
}): CacheDetails {
  const { key, args, data, ttl } = settings;
  const createdAt = new Date().toISOString();
  const expiredAt =
    ttl === null
      ? null
      : new Date(new Date().getTime() + ttl * 1000).toISOString();

  const details: CacheDetails = {
    key,
    args,
    data,
    createdAt,
    expiredAt,
  };
  return details;
}

const FS_ROOT_DIR = '.tmp/cache-control/file';

function dirs(name: string) {
  const relative = path.join(FS_ROOT_DIR, name);
  const absolute = path.resolve(relative);

  return {
    relative,
    absolute,
  };
}

function cleanup() {
  if (fs.existsSync(FS_ROOT_DIR)) {
    fs.rmSync(FS_ROOT_DIR, { recursive: true });
  }
}

beforeAll(cleanup);
afterAll(cleanup);

describe(FileCacheStorage.name, () => {
  describe('initialization', () => {
    const { relative, absolute } = dirs('init');

    it('It can be constructed.', () => {
      const storage = new FileCacheStorage({
        dir: relative,
      });
      expect(storage instanceof FileCacheStorage).toStrictEqual(true);
    });

    it(`Relative paths are resolved to absolute paths. ${relative} -> ${absolute}`, () => {
      const storage = new FileCacheStorage({
        dir: relative,
      });
      expect(storage.dir).toBe(absolute);
    });

    it('Absolute paths are not converted.', () => {
      const storage = new FileCacheStorage({
        dir: relative,
      });
      expect(storage.dir).toBe(absolute);
    });

    it('It can be built with options.', () => {
      const storage = new FileCacheStorage({
        dir: relative,
        maxTimeout: 200,
      });
      expect(storage.maxTimeout).toStrictEqual(200);
    });
  });

  describe('basic operation', () => {
    function init(name: string) {
      const { relative } = dirs(name);
      const storage = new FileCacheStorage({
        dir: relative,
      });
      const key = 'test';
      const argDt = new Date();
      const args = [1, '2', argDt.toISOString()];
      const data = { args: [1, '2', argDt.toISOString()] };
      const ttl = 1;
      const details = createDetails({ key, args, data, ttl });

      return {
        storage,
        key,
        details,
        ttl,
      };
    }

    it('It can be set.', async () => {
      const { storage, details, key } = init('set');
      await storage.set(details);
      const cache = await storage.get({ key });
      expect(cache).not.toBeNull();
    });

    it('It can be get.', async () => {
      const { storage, details, key } = init('get');
      await storage.set(details);
      const saved = await storage.get({ key });
      expect(saved).toEqual(details);
    });

    it('It can be delete.', async () => {
      const { storage, details } = init('delete');
      await storage.set(details);

      await storage.set(
        createDetails({
          key: 'add1',
          args: ['add1'],
          data: 'add1',
          ttl: null,
        }),
      );
      const saved = await storage.get({ key: 'add1' });
      expect(saved).not.toBeNull();

      await storage.delete({ key: 'add1' });

      const deleted = await storage.get({ key: 'add1' });
      expect(deleted).toBeNull();
    });

    it('After the expiration date, the cache will disappear.', async () => {
      const { storage, details, ttl, key } = init('expiration');
      await storage.set(details);

      await delay(ttl * 500);

      const saved = await storage.get({ key });
      expect(saved).toEqual(details);

      await delay(ttl * 500 + 1);

      const reFetched = await storage.get({ key });
      expect(reFetched).toEqual(null);
    });
  });
});
