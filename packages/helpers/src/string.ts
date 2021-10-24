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
