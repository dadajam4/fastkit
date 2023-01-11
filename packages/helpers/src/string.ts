/** Checks if value is string */
export function isString(source: unknown): source is string {
  return typeof source === 'string' || source instanceof String;
}

export function nilToEmptyString(source?: string | null) {
  return source == null ? '' : source;
}

export function toHalfWidth(source?: string | null) {
  return nilToEmptyString(source).replace(/[！-～]/g, (source) => {
    return String.fromCharCode(source.charCodeAt(0) - 0xfee0);
  });
}

export function toSingleSpace(source?: string | null) {
  return nilToEmptyString(source).replace(/([\s]+)/g, (m) => m.charAt(0));
}

export function cyrb53(str: string, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/**
 * Obtains a string with the first letter of the specified string capitalized
 *
 * - `"helloWorld"` -&gt; `"HelloWorld"`
 *
 * @param str - String of conversion source
 * @returns String with first letter converted to uppercase
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>;
}

/**
 * Obtains a string with the first letter of the specified string in lowercase.
 *
 * - `"HelloWorld"` -&gt; `"helloWorld"`
 *
 * @param str - String of conversion source
 * @returns String with first letter converted to lowercase
 */
export function uncapitalize<T extends string>(str: T): Uncapitalize<T> {
  return (str.charAt(0).toLowerCase() + str.slice(1)) as Uncapitalize<T>;
}
