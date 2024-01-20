import { arrayUnique } from './array';

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
  // eslint-disable-next-line no-prototype-builtins
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
    // eslint-disable-next-line eqeqeq
    if (a.length != b.length) return false;
    for (i = 0; i < a.length; i++)
      if (!objectIncludes(a[i], b[i])) return false;
    return true;
  }

  // eslint-disable-next-line eqeqeq
  if (arrA != arrB) return false;

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const dateA = a instanceof Date;
    const dateB = b instanceof Date;
    // eslint-disable-next-line eqeqeq
    if (dateA && dateB) return a.getTime() == b.getTime();
    // eslint-disable-next-line eqeqeq
    if (dateA != dateB) return false;

    const regexpA = a instanceof RegExp;
    const regexpB = b instanceof RegExp;
    // eslint-disable-next-line eqeqeq
    if (regexpA && regexpB) return a.toString() == b.toString();
    // eslint-disable-next-line eqeqeq
    if (regexpA != regexpB) return false;

    const keys = Object.keys(a);
    // if (keys.length !== Object.keys(b).length) return false;

    for (i = 0; i < keys.length; i++)
      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = 0; i < keys.length; i++)
      if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;

    return true;
  }
  if (a && b && typeof a === 'function' && typeof b === 'function') {
    return a.toString() === b.toString();
  }

  return false;
}

/**
 * Returns `true` if it is a iterable object
 * */
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
// eslint-disable-next-line default-param-last
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
  const entries = new Map(rows.map((row, index) => cb(row, index)));
  return Object.fromEntries(entries) as Record<K, T>;
}

objectFromArray.build =
  <R, T>(rows: R[] | readonly R[]) =>
  // eslint-disable-next-line no-shadow
  <K extends string | number | symbol, T>(
    cb: (row: R, index: number) => [K, T],
  ) =>
    objectFromArray(rows, cb);

/**
 * To obtain an object with all undefined properties completely removed from the specified object.
 *
 * @param obj - object
 * @param deep - Recursively delete undefined properties
 * @returns Objects with undefined properties already deleted
 */
export function removeUndef<T extends Record<string, any>>(
  obj: T,
  deep = false,
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
  return array.reduce(
    (prev, current) => {
      prev[current[key]] = current;
      return prev;
    },
    {} as Record<T[K], T>,
  );
}

/**
 * To obtain a new object that extracts properties corresponding to specified keys from the given object
 *
 * @param obj - Source object for extraction
 * @param props - List of property names to extract
 * @param includesUndefined - Extract `undefined` values as well?
 * @returns Extracted objects
 */
export function pickProperties<
  T extends Record<keyof any, any>,
  K extends keyof T,
>(obj: T, props: K[], includesUndefined?: boolean): Pick<T, K> {
  const results = {} as Pick<T, K>;
  for (const prop of props) {
    const value = obj[prop];
    if (includesUndefined || value !== undefined) {
      results[prop] = value;
    }
  }
  return results;
}

/**
 * Retrieve a new object by removing the property corresponding to the specified key from the given object
 *
 * @param obj - Source object
 * @param props - List of property names to be removed
 * @param excludeUndefined - After performing the removal, further undefined properties can be removed or
 * @returns Objects with specified properties already removed
 */
export function omitProperties<
  T extends Record<keyof any, any>,
  K extends keyof T,
>(obj: T, props: K[], excludeUndefined?: boolean): Omit<T, K> {
  const results = {
    ...obj,
  } as Omit<T, K>;
  for (const prop of props) {
    delete (results as any)[prop];
  }
  return excludeUndefined ? removeUndef(results) : results;
}

export type Mixin<T extends object, U extends object> = Omit<T, keyof U> & U;

/**
 * Returns a Proxy instance that mixes in the specified trait object for the given base object
 *
 * @param base - Base object
 * @param trait - trait object
 * @returns Mixed-in Proxy
 */
export function mixin<T extends object, U extends object>(
  base: T,
  trait: U,
): Mixin<T, U> {
  const proxy = new Proxy(base, {
    get: (_target, propertyKey, receiver) => {
      const target = Reflect.has(trait, propertyKey) ? trait : _target;
      return Reflect.get(target, propertyKey, receiver);
    },
    has: (target, propertyKey) =>
      Reflect.has(trait, propertyKey) || Reflect.has(target, propertyKey),
    ownKeys: (target) =>
      arrayUnique([...Reflect.ownKeys(target), ...Reflect.ownKeys(trait)]),
  }) as any;
  return proxy;
}
