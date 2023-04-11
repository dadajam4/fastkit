/** Checks if value is string */
export function isString(source: unknown): source is string {
  return typeof source === 'string' || source instanceof String;
}

/** Escapes empty-like values (`null`, `undefined`) to empty string */
export function nilToEmptyString(source?: string | null): string {
  return source == null ? '' : source;
}

/**
 * Convert string to lowercase
 * @param source - String to be converted
 * @returns Converted string
 */
export function toHalfWidth(source?: string | null) {
  return nilToEmptyString(source).replace(/[！-～]/g, (source) => {
    return String.fromCharCode(source.charCodeAt(0) - 0xfee0);
  });
}

/**
 * Convert all consecutive spaces to single space
 * @param source - String to be converted
 * @returns Converted string
 */
export function toSingleSpace(source?: string | null) {
  return nilToEmptyString(source).replace(/([\s]+)/g, (m) => m.charAt(0));
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
