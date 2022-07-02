import { Duration } from '@fastkit/duration';
import { CacheController } from '@fastkit/cache-control';
import {
  AsyncHandlerCacheRevalidateCondition,
  RawAsyncHandlerCacheBehavior,
  AsyncHandlerErrorLogger,
  AsyncHandlerCacheSettings,
  AsyncHandlerCacheBehavior,
  AsyncHandlerCacheErrorHandlerMap,
  AsyncHandlerCacheRevalidateChecker,
} from './schemes';

export function normalizeAsyncHandlerCacheRevalidateCondition<T = any>(
  source: AsyncHandlerCacheRevalidateCondition<T>,
): AsyncHandlerCacheRevalidateChecker<T> {
  if (typeof source === 'function') return source;
  if (source === 'always') return () => true;

  const duration =
    typeof source === 'number' ? Duration.seconds(source) : source;
  return (details) =>
    details.remainingTimes.milliseconds < duration.milliseconds;
}

export function resolveRawAsyncHandlerCacheBehavior<T = any>(
  raw: RawAsyncHandlerCacheBehavior<T>,
  settings: { errorLogger: AsyncHandlerErrorLogger },
): AsyncHandlerCacheSettings<T> {
  const { errorLogger } = settings;

  let controller: CacheController<T>;
  let behavior: AsyncHandlerCacheBehavior<T>;
  let errorHandlers: AsyncHandlerCacheErrorHandlerMap;
  let revalidate: AsyncHandlerCacheRevalidateChecker<T> | undefined;

  const isController = raw instanceof CacheController;
  if (isController) {
    controller = raw;
    behavior = { ...controller.behavior };
    errorHandlers = {
      get: errorLogger,
      set: errorLogger,
    };
  } else {
    controller = new CacheController(raw);
    behavior = { ...raw };
    if (raw.revalidate != null) {
      revalidate = normalizeAsyncHandlerCacheRevalidateCondition(
        raw.revalidate,
      );
    }
    errorHandlers = {
      get: errorLogger,
      set: errorLogger,
      ...raw.errorHandlers,
    };
  }

  return {
    controller,
    behavior,
    revalidate,
    errorHandlers,
  };
}
