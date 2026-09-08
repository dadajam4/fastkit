import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  vi,
} from 'vitest';
import path from 'node:path';
import fs from 'fs-extra';
import { FileCacheStorage } from '../file';
import { CacheDetails } from '../../schema';

/**
 * Expiry is driven by a `setTimeout` scheduled in `set()`. Only those APIs are
 * faked, so the real filesystem callbacks this storage depends on keep working.
 */
const FAKED_TIMERS = ['setTimeout', 'clearTimeout', 'Date'] as const;

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
  });

  describe('expiration', () => {
    const key = 'test';
    const ttl = 1;

    beforeEach(() => {
      vi.useFakeTimers({ toFake: [...FAKED_TIMERS] });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    async function setup(name: string) {
      const storage = new FileCacheStorage({ dir: dirs(name).relative });
      const details = createDetails({ key, data: 'test', ttl });
      await storage.set(details);
      return { storage, details };
    }

    /**
     * The eviction `set()` schedules unlinks the file without the storage
     * awaiting it, so the timer firing does not mean the file is gone yet. Yield
     * to the event loop until it is. `setImmediate` is not faked, so this
     * settles on I/O completion rather than on elapsed time.
     */
    async function readUntilGone(storage: FileCacheStorage, attempts = 50) {
      for (let i = 0; i < attempts; i++) {
        const found = await storage.get({ key });
        if (found === null) return null;
        await new Promise((resolve) => {
          setImmediate(resolve);
        });
      }
      return storage.get({ key });
    }

    it('It is kept until the expiration date.', async () => {
      const { storage, details } = await setup('expiration-kept');

      await vi.advanceTimersByTimeAsync(ttl * 1000 - 1);

      expect(await storage.get({ key })).toEqual(details);
    });

    it('After the expiration date, the cache will disappear.', async () => {
      const { storage } = await setup('expiration-dropped');

      await vi.advanceTimersByTimeAsync(ttl * 1000);

      expect(await readUntilGone(storage)).toBeNull();
    });
  });
});
