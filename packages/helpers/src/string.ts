/** Checks if value is string */
export function isString(source: unknown): source is string {
  return typeof source === 'string' || source instanceof String;
}

/** Escapes empty-like values (`null`, `undefined`) to empty string */
export function nilToEmptyString(source?: string | null): string {
  return source == null ? '' : source;
}

const FULL_WIDTH_SYMBOL_RE = /[！-～]/g;

// eslint-disable-next-line no-irregular-whitespace
const FULL_WIDTH_SPACE_RE = /　/g;

/**
 * Convert string to lowercase
 *
 * The target includes full-width alphanumeric characters, symbols, and whitespace characters.
 *
 * @param source - String to be converted
 * @returns Converted string
 */
export function toHalfWidth(source?: string | null) {
  return nilToEmptyString(source)
    .replace(FULL_WIDTH_SYMBOL_RE, (_source) =>
      String.fromCharCode(_source.charCodeAt(0) - 0xfee0),
    )
    .replace(FULL_WIDTH_SPACE_RE, ' ');
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

const INDENT_MATCH_RE = /^[ \t]*(?=\S)/gm;

/**
 * Ignore blank lines and get the number of indent characters in the line with the lowest number of leading spaces
 *
 * @param str - String to get indentation
 * @returns Minimum indent character count
 */
export function minIndent(str: string): number {
  const match = str.match(INDENT_MATCH_RE);

  if (!match) {
    return 0;
  }

  return match.reduce((r, a) => Math.min(r, a.length), Infinity);
}

const STRIP_INDENT_UNNECESSARY_LINE_MATCH_RE = /(^\n+|\n\s+$)/g;

/**
 * Obtain a string with the minimum number of indent characters removed
 *
 * @remarks This method trims unnecessary lines (newlines, whitespace only) before and after. This process can be disabled with `retainUnnecessaryLines`
 *
 * @param str - String to remove indentation
 * @param retainUnnecessaryLines - Retain unnecessary lines
 * @returns String with normalized indentation
 */
export function stripIndent(
  str: string,
  retainUnnecessaryLines?: boolean,
): string {
  if (!retainUnnecessaryLines) {
    str = str.replace(STRIP_INDENT_UNNECESSARY_LINE_MATCH_RE, '');
  }

  const indent = minIndent(str);

  if (indent === 0) {
    return str;
  }

  const regex = new RegExp(`^[ \\t]{${indent}}`, 'gm');

  return str.replace(regex, '');
}
