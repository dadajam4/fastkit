import { describe, it, expect } from 'vitest';
import { CacheController } from '../controller';
import { MemoryCacheStorage } from '../storages';
import { CacheStorage } from '../schemes';
import { delay } from '@fastkit/helpers';
import { Duration } from '@fastkit/duration';

function runControllerTests(createStorage: () => CacheStorage<any>) {
  describe(CacheController.name, () => {
    describe('initialization', () => {
      it('It can be constructed.', () => {
        const storage = createStorage();
        expect(storage instanceof MemoryCacheStorage).toStrictEqual(true);

        const controller = new CacheController({
          storage,
          ttl: 60,
        });

        expect(controller.ttl).toStrictEqual(60);
        expect(controller.storage).toStrictEqual(storage);
      });

      it('It can be built with options.', () => {
        const storage = createStorage();
        const controller = new CacheController({
          storage,
          ttl: Duration.hours(1),
        });

        expect(new Duration(controller.ttl)).toStrictEqual(Duration.hours(1));
      });
    });
  });

  describe('basic operation', () => {
    const storage = createStorage();
    expect(storage instanceof MemoryCacheStorage).toStrictEqual(true);

    const controller = new CacheController({
      storage,
      ttl: 1,
    });

    it('It can be set.', async () => {
      const details1 = await controller.set({
        key: 'key-1',
        args: [1],
        data: { hoge: 'fuga' },
      });

      const details2 = await controller.set({
        key: 'key-2',
        args: [2],
        data: { hoge: 'piyo' },
        ttl: -1,
      });

      expect(details1.key).toStrictEqual('key-1');
      expect(details1.args).toStrictEqual([1]);
      expect(details1.data).toStrictEqual({ hoge: 'fuga' });
      expect(details1.expiredAt).not.toBeNull();

      expect(details2.key).toStrictEqual('key-2');
      expect(details2.args).toStrictEqual([2]);
      expect(details2.data).toStrictEqual({ hoge: 'piyo' });
      expect(details2.expiredAt).toBeNull();
    });

    it('It can be get.', async () => {
      const details1 = await controller.get({ key: 'key-1' });
      const details2 = await controller.get('key-2');
      const details3 = await controller.get({ key: 'key-3' });

      expect(details1).not.toBeNull();
      expect(details2).not.toBeNull();
      expect(details3).toBeNull();

      if (!details1 || !details2) {
        throw new Error();
      }

      expect(details1.key).toStrictEqual('key-1');
      expect(details1.args).toStrictEqual([1]);
      expect(details1.data).toStrictEqual({ hoge: 'fuga' });
      expect(details1.expiredAt).not.toBeNull();

      expect(details2.key).toStrictEqual('key-2');
      expect(details2.args).toStrictEqual([2]);
      expect(details2.data).toStrictEqual({ hoge: 'piyo' });
      expect(details2.expiredAt).toBeNull();
    });

    it('When it expires, null is obtained.', async () => {
      await delay(500);

      let details1 = await controller.get('key-1');
      let details2 = await controller.get({ key: 'key-2' });

      expect(details1).not.toBeNull();
      expect(details2).not.toBeNull();

      await delay(500);

      details1 = await controller.get({ key: 'key-1' });
      details2 = await controller.get({ key: 'key-2' });

      expect(details1).toBeNull();
      expect(details2).not.toBeNull();
    });

    it('It can be delete.', async () => {
      await controller.set({
        key: 'key-1',
        args: [1],
        data: { hoge: 'fuga' },
      });

      let details1 = await controller.get('key-1');
      let details2 = await controller.get({ key: 'key-2' });

      expect(details1).not.toBeNull();
      expect(details2).not.toBeNull();

      await controller.delete('key-1');
      await controller.delete({ key: 'key-2' });

      details1 = await controller.get('key-1');
      details2 = await controller.get({ key: 'key-2' });

      expect(details1).toBeNull();
      expect(details2).toBeNull();
    });
  });
}

runControllerTests(() => new MemoryCacheStorage());
