import { createCatcherResolver } from '../schemes';

/**
 * Override Native Error
 */
export interface NativeErrorOverrides {
  /** Native Error */
  nativeError?: Error;
}

/**
 * Resolver to Native exceptions
 */
export const nativeErrorResolver = createCatcherResolver(
  (source: unknown): NativeErrorOverrides | undefined => {
    if (source && source instanceof Error) {
      return {
        nativeError: source,
      };
    }
  },
);
