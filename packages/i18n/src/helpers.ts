import {
  I18nDependenciesMap,
  I18nOptions,
  I18nValueScheme,
  BuiltinI18nStorage,
} from './schemes';
import { defineI18nStorage } from './builder';
import type { I18n } from './i18n';
import { LINKED_SYMBOL } from './injections';
import { logger } from './logger';

/**
 * Recursively retrieves the key value of the specified object and returns a new array with the key flattened.
 *
 * @exmaple
 *   `{ a: 1, b: { a: true }, c: [1, 2] }`
 *   to
 *   `{ a: 1, b: { a: true }, 'b.a': true, c: [1, 2], 'c.0': 1, 'c.1': 2 }`
 *
 * @param obj - Objects to be flattened.
 * @param prefix - Key prefix.
 * @returns Flattened objects
 */
export function toFlattenedObject(
  obj: any,
  prefix = '',
): { [key: string]: any } {
  const flattenedObj: any = {};
  for (const key of Object.keys(obj)) {
    const _key = `${prefix}${key}`;
    const value = obj[key];
    flattenedObj[_key] = value;
    if (value && typeof value === 'object') {
      Object.assign(flattenedObj, toFlattenedObject(value, `${_key}.`));
    }
  }
  return flattenedObj;
}

export function createI18nDependenciesMap<
  ValueScheme extends I18nValueScheme<
    ValueScheme,
    DatetimeFormats,
    NumberFormats
  >,
  DatetimeFormats extends Record<
    string,
    Intl.DateTimeFormatOptions | undefined
  >,
  NumberFormats extends Record<string, Intl.NumberFormatOptions | undefined>,
  LocaleName extends string,
  Meta extends Record<keyof any, unknown> = Record<keyof any, unknown>,
>(
  options: I18nOptions<
    ValueScheme,
    DatetimeFormats,
    NumberFormats,
    LocaleName,
    Meta
  >,
): I18nDependenciesMap<LocaleName> {
  const { locales, fallbackLocale } = options;

  const [baseLocale, ...subLocales] = locales;
  const baseLocaleName = baseLocale.name;

  const results = {
    [baseLocaleName]: [baseLocaleName],
  } as I18nDependenciesMap<LocaleName>;

  for (const subLocale of subLocales) {
    const subLocaleName = subLocale.name;
    results[subLocaleName] = [subLocaleName];

    const myFallback = subLocale.fallbackLocale as LocaleName | undefined;

    let fallback: LocaleName | undefined;

    if (myFallback) {
      fallback = myFallback;
    } else {
      fallback =
        fallbackLocale &&
        (typeof fallbackLocale === 'string'
          ? fallbackLocale
          : fallbackLocale[subLocaleName]);
    }

    if (fallback && fallback !== baseLocaleName) {
      results[subLocaleName].push(fallback);
    }
    results[subLocaleName].push(baseLocaleName);
  }

  return results;
}

export function createBuiltinStorage(): BuiltinI18nStorage {
  const store: { [key: string]: any } = {};

  const storage = defineI18nStorage({
    store: store,
    get: (key) => {
      return store[key];
    },
    set: (key, value) => {
      store[key] = value;
    },
  });

  return storage;
}

const normalizeLocaleRe = /[_]/g;

export function normalizeLocale(locale: string) {
  return locale.replace(normalizeLocaleRe, '-').toLowerCase();
}

export function injectI18n(
  i18n: I18n<any, any, any>,
  target: any,
  locale: any,
) {
  if ((target as any)[LINKED_SYMBOL]) {
    const targetType = 'name' in target ? 'locale settings' : 'locale scheme';
    logger.warn(
      `This ${targetType}("${locale}") has already been assigned to the i18n service instance. Using locales in multiple instances may not work as expected.`,
    );
  }
  target[LINKED_SYMBOL] = i18n;
}
