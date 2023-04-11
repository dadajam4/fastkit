import { isPlainObject } from '@fastkit/helpers';
import { logger } from './logger';

const normalizeLocaleRe = /[_\-]/g;

export function normalizeLocale(locale: string) {
  return locale.replace(normalizeLocaleRe, '-').toLowerCase();
}

/**
 * Normalize locale name-like strings to valid locale names
 *
 * @example
 *
 * When the valid locales are `["ja", "en", "zh-cn", "zh-tw"]` and the default locale is `"ja"`.
 *
 * * `"ja"` -> `"ja"`
 * * `"ja-JP"` -> `"ja"`
 * * `"JA-JP"` -> `"ja"`
 * * `"en-US"` -> `"en"`
 * * `"enus"` -> `"ja"`
 * * `"zh_TW"` -> `"zh-tw"`
 * * `"zh"` -> `"zh-cn"`
 * * `"ZH"` -> `"zh-cn"`
 * * `"zh-hoge"` -> `"zh-cn"`
 *
 * @param localeLikeString - Locale name-like string
 * @param availableLocales - List of valid locale names
 * @param defaultLocale - default locale name
 * @returns Valid locale name
 */
export function resolveLocale<
  LocaleName extends string,
  Default extends LocaleName | undefined = undefined,
>(
  localeLikeString: LocaleName | string,
  availableLocales: LocaleName[],
  defaultLocale?: Default,
): LocaleName | Default {
  if (availableLocales.includes(localeLikeString as LocaleName)) {
    return localeLikeString as LocaleName;
  }
  localeLikeString = normalizeLocale(localeLikeString as string);
  let resolved: LocaleName | undefined;
  while (true) {
    for (const locale of availableLocales) {
      const normalizedLocale = normalizeLocale(locale);
      if (normalizedLocale === localeLikeString) {
        resolved = locale;
        break;
      }
    }
    if (resolved) {
      break;
    }
    const tmp: string[] = localeLikeString.split('-');
    tmp.length = tmp.length - 1;
    if (!tmp.length) {
      break;
    }
    localeLikeString = tmp.join('-');
  }

  if (!resolved) {
    const argPrefix = localeLikeString
      .split(normalizeLocaleRe)[0]
      .toLowerCase();
    for (const locale of availableLocales) {
      const prefix = locale.split(normalizeLocaleRe)[0].toLowerCase();
      if (argPrefix === prefix) {
        return locale;
      }
    }
  }
  return resolved || (defaultLocale as Default);
}

/**
 * Recursively retrieves the key value of the specified object and returns a new array with the key flattened.
 *
 * @exmaple
 *
 * ```
 * class Custom {
 *   myName = 'Custom';
 * }
 *
 * const data = {
 *   a: 1,
 *   b: { a: true },
 *   c: [1, 2],
 *   d: new Date(),
 *   e: /^hoge$/,
 *   f: function() {},
 *   g: new Custom(),
 *   h: {
 *     a: 1,
 *     b: { a: true },
 *     c: [1, 2],
 *     d: new Date(),
 *     e: /^hoge$/,
 *     f: function() {},
 *     g: new Custom(),
 *   }
 * };
 *
 * // to
 *
 * {
 *   a: 1,
 *   b: { a: true },
 *   'b.a': true,
 *   c: [ 1, 2 ],
 *   d: 2022-11-07T06:30:59.956Z,
 *   e: /^hoge$/,
 *   f: [Function: f],
 *   g: Custom { myName: 'Custom' },
 *   h: {
 *     a: 1,
 *     b: { a: true },
 *     c: [ 1, 2 ],
 *     d: 2022-11-07T06:30:59.957Z,
 *     e: /^hoge$/,
 *     f: [Function: f],
 *     g: Custom { myName: 'Custom' }
 *   },
 *   'h.a': 1,
 *   'h.b': { a: true },
 *   'h.b.a': true,
 *   'h.c': [ 1, 2 ],
 *   'h.d': 2022-11-07T06:30:59.957Z,
 *   'h.e': /^hoge$/,
 *   'h.f': [Function: f],
 *   'h.g': Custom { myName: 'Custom' }
 * }
 * ```
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
    if (isPlainObject(value)) {
      Object.assign(flattenedObj, toFlattenedObject(value, `${_key}.`));
    }
  }
  return flattenedObj;
}

/**
 * Get a list of normalized locale names for a given locale name
 *
 * * If the specified locale name is invalid, this is an empty list
 *
 * @see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/getCanonicalLocales
 *
 * @param locales
 * @returns
 */
export function safeGetCanonicalLocales(locales: string | string[]): string[] {
  try {
    // @TODO https://github.com/microsoft/TypeScript/issues/29129
    return (Intl as any).getCanonicalLocales(locales);
  } catch (err) {
    logger.warn(
      `The specified locale name(${JSON.stringify(
        locales,
      )}) is invalid and falls back to the unspecified state.`,
    );
    return [];
  }
}
