export function isObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

// cloned from https://github.com/epoberezkin/fast-deep-equal with small changes
export function objectIncludes(b: any, a: any): boolean {
  if (a === b) return true;

  const arrA = Array.isArray(a);
  const arrB = Array.isArray(b);
  let i: number;

  if (arrA && arrB) {
    if (a.length != b.length) return false;
    for (i = 0; i < a.length; i++)
      if (!objectIncludes(a[i], b[i])) return false;
    return true;
  }

  if (arrA != arrB) return false;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const dateA = a instanceof Date,
      dateB = b instanceof Date;
    if (dateA && dateB) return a.getTime() == b.getTime();
    if (dateA != dateB) return false;

    const regexpA = a instanceof RegExp,
      regexpB = b instanceof RegExp;
    if (regexpA && regexpB) return a.toString() == b.toString();
    if (regexpA != regexpB) return false;

    const keys = Object.keys(a);
    // if (keys.length !== Object.keys(b).length) return false;

    for (i = 0; i < keys.length; i++)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = 0; i < keys.length; i++)
      if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;

    return true;
  } else if (a && b && typeof a === 'function' && typeof b === 'function') {
    return a.toString() === b.toString();
  }

  return false;
}

/**
 * Returns `true` if it is a iterable object
 **/
export function isIterableObject<T = any>(source?: any): source is Iterable<T> {
  return (
    Array.isArray(source) ||
    (source &&
      typeof source === 'object' &&
      source.constructor.name === 'Object') ||
    false
  );
}

/**
 * @see: https://github.com/vuejs/vue-router/blob/c69ff7bd60228fb79acd764c3fdae91015a49103/src/util/route.js#L96
 */
export function isObjectEqual<T extends any>(
  a: T = {} as T,
  b: unknown,
): b is T {
  // handle null value #1566
  if (!a || !b) return a === b;
  if (!isObject(b)) return false;
  const aKeys = Object.keys(a as any);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => {
    const aVal = (a as any)[key];
    const bVal = b[key];
    // query values can be null and undefined
    if (aVal == null || bVal == null) return aVal === bVal;
    // check nested equality
    if (typeof aVal === 'object' && typeof bVal === 'object') {
      return isObjectEqual(aVal, bVal);
    }
    return String(aVal) === String(bVal);
  });
}
