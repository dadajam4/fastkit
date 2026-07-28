import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MemoryCacheStorage } from '../memory';
import { CacheDetails } from '../../schemes';

/**
 * Expiry is driven by a `setTimeout` scheduled in `set()`, so only the timer
 * APIs the storage actually uses are faked. Leaving the rest alone keeps promise
 * scheduling real.
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

describe(MemoryCacheStorage.name, () => {
  describe('initialization', () => {
    it('It can be constructed.', () => {
      const storage = new MemoryCacheStorage();
      expect(storage instanceof MemoryCacheStorage).toStrictEqual(true);
    });

    it('It can be built with options.', () => {
      const storage = new MemoryCacheStorage({
        maxKeys: 100,
        maxTimeout: 200,
      });
      expect(storage.maxKeys).toStrictEqual(100);
      expect(storage.maxTimeout).toStrictEqual(200);
    });
  });

  describe('basic operation', () => {
    const storage = new MemoryCacheStorage();
    const key = 'test';
    const argDt = new Date();
    const args = [1, '2', argDt];
    const data = { args: [1, '2', argDt] };
    // Deliberately no TTL: expiry has its own block below, and a live eviction
    // timer here would race the rest of these cases.
    const details = createDetails({ key, args, data, ttl: null });

    it('It can be set.', () => {
      expect(storage.size).toStrictEqual(0);
      storage.set(details);
      expect(storage.size).toStrictEqual(1);
    });

    it('It can be get.', () => {
      const saved = storage.get({ key });
      expect(saved).toEqual(details);
    });

    it('It can be delete.', () => {
      expect(storage.size).toStrictEqual(1);

      storage.set(
        createDetails({
          key: 'add1',
          args: ['add1'],
          data: 'add1',
          ttl: null,
        }),
      );

      expect(storage.size).toStrictEqual(2);
      storage.delete({ key: 'add1' });
      expect(storage.size).toStrictEqual(1);
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

    function setup() {
      const storage = new MemoryCacheStorage();
      const details = createDetails({ key, data: 'test', ttl });
      storage.set(details);
      return { storage, details };
    }

    it('It is kept until the expiration date.', () => {
      const { storage, details } = setup();

      vi.advanceTimersByTime(ttl * 1000 - 1);

      expect(storage.get({ key })).toEqual(details);
      expect(storage.size).toStrictEqual(1);
    });

    it('After the expiration date, the cache will disappear.', () => {
      const { storage } = setup();

      vi.advanceTimersByTime(ttl * 1000);

      expect(storage.get({ key })).toBeNull();
      expect(storage.size).toStrictEqual(0);
    });
  });

  describe('Control of a large number of caches', () => {
    const maxKeys = 100;

    const storage = new MemoryCacheStorage({
      maxKeys,
    });

    it('Up to a maximum key limit can be registered.', () => {
      for (let i = 0; i < maxKeys; i++) {
        const details = createDetails({
          key: String(i),
          args: [i],
          data: i,
          ttl: null,
        });
        storage.set(details);
      }
      expect(storage.size).toStrictEqual(maxKeys);
    });

    it('If the maximum key length is exceeded, the oldest cache is deleted first.', async () => {
      storage.set(
        createDetails({
          key: 'add1',
          args: ['add1'],
          data: 'add1',
          ttl: null,
        }),
      );

      let pick0 = await storage.get({ key: '0' });
      let pick1 = await storage.get({ key: '1' });

      expect(storage.size).toStrictEqual(maxKeys);
      expect(pick0).toBeNull();
      expect(pick1 && pick1.data).toBe(1);

      storage.set(
        createDetails({
          key: 'add1',
          args: ['add1'],
          data: 'add1-2',
          ttl: null,
        }),
      );

      pick0 = await storage.get({ key: '0' });
      pick1 = await storage.get({ key: '1' });

      expect(storage.size).toStrictEqual(maxKeys);
      expect(pick0).toBeNull();
      expect(pick1 && pick1.data).toBe(1);

      storage.set(
        createDetails({
          key: 'add2',
          args: ['add2'],
          data: 'add2',
          ttl: null,
        }),
      );

      pick0 = await storage.get({ key: '0' });
      pick1 = await storage.get({ key: '1' });

      expect(storage.size).toStrictEqual(maxKeys);
      expect(pick0).toBeNull();
      expect(pick1).toBeNull();
    });

    it(`The cache can be cleared by executing ${storage.clear.name}().`, () => {
      expect(storage.size).toStrictEqual(maxKeys);
      storage.clear();
      expect(storage.size).toStrictEqual(0);
    });
  });
});
