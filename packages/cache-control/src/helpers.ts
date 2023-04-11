import { clone } from '@fastkit/cloner';
import { Duration } from '@fastkit/duration';

import {
  CreateCacheDetailsSettings,
  CacheDetails,
  CacheRemainingTimes,
  CacheDetailsWithRemainingTimes,
} from './schemes';

export function toCacheRemainingTimes<T = any>(
  source: CacheDetails<T>,
  now: Date | number | string = Date.now(),
): CacheRemainingTimes {
  const nowDt = now instanceof Date ? now.getTime() : new Date(now).getTime();
  const { createdAt, expiredAt } = source;
  const elapsedTimes = new Duration([createdAt, nowDt]);
  const remainingTimesSource =
    expiredAt == null
      ? Infinity
      : Math.max(new Date(expiredAt).getTime() - nowDt, 0);
  const remainingTimes = new Duration(remainingTimesSource);
  const expired = remainingTimes.milliseconds === 0;

  return {
    elapsedTimes,
    remainingTimes,
    expired,
  };
}

export function toCacheDetailsWithRemainingTimes<T = any>(
  source: CacheDetails<T>,
  now?: Date | number | string,
): CacheDetailsWithRemainingTimes<T> {
  return {
    ...source,
    ...toCacheRemainingTimes(source, now),
  };
}

/**
 * Generate cache details.
 *
 * @param settings - Settings for cache creation.
 * @param createdAt - Cache creation date.
 */
export function createCacheDetails<T = any>(
  settings: CreateCacheDetailsSettings<T>,
  createdAt: number | string | Date = new Date(),
): CacheDetails<T> {
  const { key, args, data, ttl } = settings;
  const createdAtDt =
    createdAt instanceof Date ? createdAt : new Date(createdAt);

  let expiredAt: string | null;

  if ((ttl as number) >= 0 && ttl !== Infinity) {
    const duration = typeof ttl === 'number' ? Duration.seconds(ttl) : ttl;
    const expiredAtDt = new Date(createdAtDt.getTime() + duration.milliseconds);
    expiredAt = expiredAtDt.toISOString();
  } else {
    expiredAt = null;
  }

  return {
    key,
    args: clone(args),
    data: clone(data),
    createdAt: createdAtDt.toISOString(),
    expiredAt,
  };
}
