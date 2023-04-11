/**
 * Checks if the specified variable is a not Nullable.
 *
 * @param value - Variables to be examined
 *
 * @returns
 *  - `null` -&gt; `false`
 *  - `undefined` -&gt; `false`
 *  - `0` -&gt; `true`
 *  - `1` -&gt; `true`
 *  - `""` -&gt; `true`
 *  - `"0"` -&gt; `true`
 *  - `{}` -&gt; `true`
 *  - `[]` -&gt; `true`
 */
export function inNonNullable<T>(
  value: T,
): value is Exclude<T, null | undefined> {
  return value != null;
}

/**
 * Checks if the specified variable is a NonNull object.
 *
 * @param value - Variables to be examined
 *
 * @returns
 *  - `null` -&gt; `false`
 *  - `1` -&gt; `false`
 *  - `"1"` -&gt; `false`
 *  - `{}` -&gt; `true`
 *  - `[]` -&gt; `true`
 *  - `new Date()` -&gt; `true`
 *  - `new RegExp()` -&gt; `true`
 *  - `new SomeClass()` -&gt; `true`
 */
export function isNonNullObject<
  T extends Record<string, unknown> = Record<string, unknown>,
>(value: unknown): value is T {
  return !!value && typeof value === 'object';
}

/**
 * Checks if the specified variable is a derived instance of the `Object` class.
 *
 * @param value - Variables to be examined
 * @returns
 *  - `null` -&gt; `false`
 *  - `1` -&gt; `false`
 *  - `"1"` -&gt; `false`
 *  - `{}` -&gt; `true`
 *  - `[]` -&gt; `false`
 *  - `new Date()` -&gt; `false`
 *  - `new RegExp()` -&gt; `false`
 *  - `new SomeClass()` -&gt; `true`
 *  - `new (class SomeClass extends ParentClass {})()` -&gt; `true`
 *  - `new (class SomeClass extends Array {})()` -&gt; `false`
 */
export function isObject<
  T extends Record<string, unknown> = Record<string, unknown>,
>(value: unknown): value is T {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Checks if the specified variable is a direct instance of the `Object` class.
 *
 * @param value - Variables to be examined
 * @returns
 *  - `null` -&gt; `false`
 *  - `1` -&gt; `false`
 *  - `"1"` -&gt; `false`
 *  - `{}` -&gt; `true`
 *  - `[]` -&gt; `false`
 *  - `new Date()` -&gt; `false`
 *  - `new RegExp()` -&gt; `false`
 *  - `new SomeClass()` -&gt; `false`
 */
export function isPlainObject<
  T extends Record<string, unknown> = Record<string, unknown>,
>(value: unknown): value is T {
  if (!isObject(value)) return false;

  // If has modified constructor
  const ctor = value.constructor;
  if (value.constructor === undefined) return true;

  // If has modified prototype
  const prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
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
 * @see https://github.com/vuejs/vue-router/blob/c69ff7bd60228fb79acd764c3fdae91015a49103/src/util/route.js#L96
 */
export function isObjectEqual<T>(a: T = {} as T, b: unknown): b is T {
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

export function objectFromArray<R, K extends string | number | symbol, T>(
  rows: R[] | readonly R[],
  cb: (row: R, index: number) => [K, T],
): Record<K, T> {
  const entries = new Map(
    rows.map((row, index) => {
      return cb(row, index);
    }),
  );
  return Object.fromEntries(entries) as Record<K, T>;
}

objectFromArray.build =
  <R, T>(rows: R[] | readonly R[]) =>
  <K extends string | number | symbol, T>(
    cb: (row: R, index: number) => [K, T],
  ) =>
    objectFromArray(rows, cb);

export function removeUndef<T extends Record<string, any>>(
  obj: T,
  deep?: boolean,
): T {
  return Object.keys(obj).reduce((result, key) => {
    let value: any = obj[key];
    if (value !== undefined) {
      if (deep && value && typeof value === 'object') {
        value = removeUndef(value, true);
      }
      (result as any)[key] = value;
    }
    return result;
  }, {}) as T;
}

export function mapFromObjectArray<
  T extends Record<keyof any, any>,
  K extends keyof T,
>(array: T[], key: K): Record<T[K], T> {
  return array.reduce((prev, current) => {
    prev[current[key]] = current;
    return prev;
  }, {} as Record<T[K], T>);
}
