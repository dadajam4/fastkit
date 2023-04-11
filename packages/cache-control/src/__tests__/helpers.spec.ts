import { describe, it, expect } from 'vitest';
import { CacheDetails } from '../schemes';
import {
  toCacheDetailsWithRemainingTimes,
  createCacheDetails,
} from '../helpers';

function createDetails(settings: {
  key: string;
  args?: any;
  data?: any;
  ttl: number | null;
  createdAt?: Date;
}): CacheDetails {
  const {
    key,
    args,
    data,
    ttl,
    createdAt: createdAtDt = new Date(),
  } = settings;
  const createdAt = createdAtDt.toISOString();
  const expiredAt =
    ttl === null
      ? null
      : new Date(createdAtDt.getTime() + ttl * 1000).toISOString();

  const details: CacheDetails = {
    key,
    args,
    data,
    createdAt,
    expiredAt,
  };
  return details;
}

describe('helpers', () => {
  describe(toCacheDetailsWithRemainingTimes.name, () => {
    it('Supplemental time information can be added to the cache detail information.', () => {
      const createdAt = new Date('2022-01-01T00:00:00.000Z');
      const mock1 = createDetails({
        key: 'mock1',
        data: {},
        ttl: 60,
        createdAt,
      });
      const result1 = toCacheDetailsWithRemainingTimes(
        mock1,
        '2022-01-01T00:00:00.000Z',
      );
      expect(result1.createdAt).toBe(createdAt.toISOString());
      expect(result1.expiredAt).toBe('2022-01-01T00:01:00.000Z');
      expect(result1.elapsedTimes.milliseconds).toBe(0);
      expect(result1.remainingTimes.milliseconds).toBe(60000);
      expect(result1.expired).toBe(false);

      const result2 = toCacheDetailsWithRemainingTimes(
        mock1,
        '2022-01-01T00:00:30.000Z',
      );

      expect(result2.elapsedTimes.milliseconds).toBe(30000);
      expect(result2.remainingTimes.milliseconds).toBe(30000);
      expect(result2.expired).toBe(false);

      const result3 = toCacheDetailsWithRemainingTimes(
        mock1,
        '2022-01-01T00:00:59.999Z',
      );

      expect(result3.elapsedTimes.milliseconds).toBe(59999);
      expect(result3.remainingTimes.milliseconds).toBe(1);
      expect(result3.expired).toBe(false);

      const result4 = toCacheDetailsWithRemainingTimes(
        mock1,
        '2022-01-01T00:01:00.000Z',
      );

      expect(result4.elapsedTimes.milliseconds).toBe(60000);
      expect(result4.remainingTimes.milliseconds).toBe(0);
      expect(result4.expired).toBe(true);

      const result5 = toCacheDetailsWithRemainingTimes(
        mock1,
        '2022-01-01T00:02:00.000Z',
      );

      expect(result5.elapsedTimes.milliseconds).toBe(120000);
      expect(result5.remainingTimes.milliseconds).toBe(0);
      expect(result5.expired).toBe(true);
    });
  });

  describe(createCacheDetails.name, () => {
    it('Cache detail information can be created.', () => {
      const now = new Date('2022-01-01T00:00:00.000Z');
      const details = createCacheDetails(
        {
          key: 'hoge',
          args: [1],
          data: {
            hoge: 'fuga',
          },
          ttl: 1,
        },
        now,
      );
      expect(details.key).toBe('hoge');
      expect(details.args).toStrictEqual([1]);
      expect(details.data).toStrictEqual({
        hoge: 'fuga',
      });
      expect(details.createdAt).toBe('2022-01-01T00:00:00.000Z');
      expect(details.expiredAt).toBe('2022-01-01T00:00:01.000Z');
    });

    it('The expiration date can be set in seconds.', () => {
      const now = new Date('2022-01-01T00:00:00.000Z');
      const expects: [number, string | null][] = [
        [0.999, '2022-01-01T00:00:00.999Z'],
        [0.9999, '2022-01-01T00:00:00.999Z'],
        [1, '2022-01-01T00:00:01.000Z'],
        [1.9, '2022-01-01T00:00:01.900Z'],
        [60, '2022-01-01T00:01:00.000Z'],
        [3600, '2022-01-01T01:00:00.000Z'],
        [-1, null],
        [-0.9, null],
        [Infinity, null],
        [0, '2022-01-01T00:00:00.000Z'],
      ];
      for (const [ttl, expectValue] of expects) {
        const details = createCacheDetails(
          {
            key: 'hoge',
            args: [1],
            data: {},
            ttl,
          },
          now,
        );
        expect(details.expiredAt).toBe(expectValue);
      }
    });
  });
});
