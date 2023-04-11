import { describe, it, expect } from 'vitest';
import { AsyncHandler } from '../handler';
import { AsyncHandle } from '../decorator';
import { delay } from '@fastkit/helpers';
import { MemoryCacheStorage } from '@fastkit/cache-control';

class MockClass {
  called = 0;

  @AsyncHandle()
  async fn(...args: any[]) {
    this.called++;

    await delay(100);

    return {
      args,
      called: this.called,
    };
  }

  @AsyncHandle({
    cache: {
      storage: new MemoryCacheStorage(),
      ttl: 1,
    },
  })
  async simpleCache(...args: any[]) {
    this.called++;

    await delay(100);

    return {
      args,
      called: this.called,
    };
  }
}

describe(AsyncHandler.name, () => {
  describe('initialization', () => {
    it('It can be constructed.', () => {
      const mock = new MockClass();
      const handler = AsyncHandle.getHandler(mock.fn);

      expect(handler).toBeInstanceOf(AsyncHandler);
      expect(handler.enabled).toBe(true);
      expect(handler.delay).toBe(0);
    });
  });

  describe('basic operation', () => {
    it('The process can be called.', async () => {
      const mock = new MockClass();

      const result1 = await mock.fn(1, '2', false);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      const result2 = await mock.fn(1, '2', false);

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      const result3 = await mock.fn(1, '2', false);

      expect(result3).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      await Promise.resolve();

      const result4 = await mock.fn(1, '2', false);

      expect(result4).toStrictEqual({
        args: [1, '2', false],
        called: 2,
      });

      expect(mock.called).toBe(2);
    });

    it('Asynchronous processing can be bundled.', async () => {
      const mock = new MockClass();

      const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
        mock.fn(1, '2', { hoge: false }),
        mock.fn(1, '2', { hoge: false }),
        mock.fn(1, '2', { hoge: true }),
        mock.fn(1, '2', { hoge: false }),
        mock.fn(2, '2', { hoge: false }),
        delay(50).then(() => mock.fn(1, '2', { hoge: false })),
        delay(150).then(() => mock.fn(1, '2', { hoge: false })),
      ]);

      expect(r1).toStrictEqual({
        args: [1, '2', { hoge: false }],
        called: 3,
      });
      expect(r2).toStrictEqual({
        args: [1, '2', { hoge: false }],
        called: 3,
      });
      expect(r3).toStrictEqual({
        args: [1, '2', { hoge: true }],
        called: 3,
      });
      expect(r4).toStrictEqual({
        args: [1, '2', { hoge: false }],
        called: 3,
      });
      expect(r5).toStrictEqual({
        args: [2, '2', { hoge: false }],
        called: 3,
      });
      expect(r6).toStrictEqual({
        args: [1, '2', { hoge: false }],
        called: 3,
      });
      expect(r7).toStrictEqual({
        args: [1, '2', { hoge: false }],
        called: 4,
      });

      expect(mock.called).toBe(4);
    });
  });

  describe('Use cache', () => {
    it('The cache is used while the cache exists.', async () => {
      const mock = new MockClass();
      const result1 = await mock.simpleCache(1, '2', false);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      const result2 = await mock.simpleCache(1, '2', false);

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      const result3 = await mock.simpleCache(1, '2', false);

      expect(result3).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      await Promise.resolve();

      const result4 = await mock.simpleCache(1, '2', false);

      expect(result4).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(mock.called).toBe(1);

      await delay(1000);

      const result5 = await mock.simpleCache(1, '2', false);

      expect(result5).toStrictEqual({
        args: [1, '2', false],
        called: 2,
      });

      expect(mock.called).toBe(2);
    });
  });
});
