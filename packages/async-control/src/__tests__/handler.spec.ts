import { describe, it, expect } from 'vitest';
import { AsyncHandler } from '../handler';
import { delay } from '@fastkit/helpers';
import { MemoryCacheStorage } from '@fastkit/cache-control';

function createFn(delayAmount = 100) {
  async function fn(...args: any[]) {
    fn.called++;

    await delay(delayAmount);

    return {
      args,
      called: fn.called,
    };
  }
  fn.called = 0;

  return fn;
}

describe(AsyncHandler.name, () => {
  describe('initialization', () => {
    it('It can be constructed.', () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn);

      expect(handler).toBeInstanceOf(AsyncHandler);
      expect(handler.originalFunc).toBe(fn);
      expect(handler.originalFunc.called).toBe(0);
      expect(handler.enabled).toBe(true);
      expect(handler.delay).toBe(0);
    });
  });

  describe('basic operation', () => {
    it('The process can be called.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn);

      const result1 = await handler.handler(1, '2', false);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      const result2 = await handler.handler(1, '2', false);

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      const result3 = await handler.handler(1, '2', false);

      expect(result3).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      await Promise.resolve();

      const result4 = await handler.handler(1, '2', false);

      expect(result4).toStrictEqual({
        args: [1, '2', false],
        called: 2,
      });

      expect(handler.originalFunc.called).toBe(2);
    });

    it('Asynchronous processing can be bundled.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn);

      const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
        handler.handler(1, '2', { hoge: false }),
        handler.handler(1, '2', { hoge: false }),
        handler.handler(1, '2', { hoge: true }),
        handler.handler(1, '2', { hoge: false }),
        handler.handler(2, '2', { hoge: false }),
        delay(50).then(() => handler.handler(1, '2', { hoge: false })),
        delay(150).then(() => handler.handler(1, '2', { hoge: false })),
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

      expect(handler.originalFunc.called).toBe(4);
    });

    it('Can intervene in hash functions.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn, {
        hashArgs: (a) => {
          return { a };
        },
      });

      const result1 = await handler.handler(1, '2', false);
      const result2 = await handler.handler(1, '3', true);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });
      expect(handler.originalFunc.called).toBe(1);
    });

    it('You can wait for as long as the `delay` value.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn, {
        delay: 500,
      });

      const [result1, result2] = await Promise.all([
        handler.handler(1, '2', false),
        delay(300).then(() => handler.handler(1, '2', false)),
      ]);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });
      expect(handler.originalFunc.called).toBe(1);
    });

    it('If the `enabled` option resolves as `false`, no control is performed.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn, {
        delay: 500,
        enabled: () => false,
      });

      const [result1, result2] = await Promise.all([
        handler.handler(1, '2', false),
        delay(300).then(() => handler.handler(1, '2', false)),
      ]);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 2,
      });
      expect(handler.originalFunc.called).toBe(2);
    });

    it('The execution result is recurrently cloned and dereferenced.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn);

      const [result1, result2] = await Promise.all([
        handler.handler(1, '2', false),
        handler.handler(1, '2', false),
      ]);

      expect(result1).toStrictEqual(result2);
      expect(result1).not.toBe(result2);
    });
  });

  describe('Use cache', () => {
    it('The cache is used while the cache exists.', async () => {
      const fn = createFn();
      const handler = new AsyncHandler(fn, {
        cache: {
          storage: new MemoryCacheStorage(),
          ttl: 1,
        },
      });

      const result1 = await handler.handler(1, '2', false);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      const result2 = await handler.handler(1, '2', false);

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      const result3 = await handler.handler(1, '2', false);

      expect(result3).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      await Promise.resolve();

      const result4 = await handler.handler(1, '2', false);

      expect(result4).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      await delay(1000);

      const result5 = await handler.handler(1, '2', false);

      expect(result5).toStrictEqual({
        args: [1, '2', false],
        called: 2,
      });

      expect(handler.originalFunc.called).toBe(2);
    });

    it('Setting the `revalidate` option causes the cache to be updated in the background.', async () => {
      const fn = createFn();
      const storage = new MemoryCacheStorage();
      const handler = new AsyncHandler(fn, {
        cache: {
          storage,
          ttl: 1,
          revalidate: 0.5,
        },
      });

      const result1 = await handler.handler(1, '2', false);

      expect(result1).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      const result2 = await handler.handler(1, '2', false);

      expect(result2).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      const result3 = await handler.handler(1, '2', false);

      expect(result3).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      await Promise.resolve();

      const result4 = await handler.handler(1, '2', false);

      expect(result4).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      expect(handler.originalFunc.called).toBe(1);

      await delay(550);

      const result5 = await handler.handler(1, '2', false);

      expect(result5).toStrictEqual({
        args: [1, '2', false],
        called: 1,
      });

      // The number of calls is 2 when the revalidate is triggered.
      expect(handler.originalFunc.called).toBe(2);

      await delay(150);

      // I am sure the cache is being updated.
      const result6 = await handler.handler(1, '2', false);

      expect(result6).toStrictEqual({
        args: [1, '2', false],
        called: 2,
      });

      expect(handler.originalFunc.called).toBe(2);
      await delay(500);
      expect(handler.originalFunc.called).toBe(2);

      const result7 = await handler.handler(1, '2', false);

      expect(result7).toStrictEqual({
        args: [1, '2', false],
        called: 3,
      });

      expect(handler.originalFunc.called).toBe(3);
    });
  });
});
