import { isSet, isMap, copyBuffer, isArrayBufferView } from '@fastkit/helpers';

/**
 * Key & Value Processor at Clone
 *
 * Function to correct the value according to the key & value status.
 *
 * @example
 *
 * ```
 * // Mask the value if the key is `"password"`.
 * (key, value) => key === 'password' ? 'xxxxx' : value
 * ```
 */
export type ClonerKeyProcesser = (key: string, value: any) => any;

/**
 * Value Processor at Clone
 *
 * Correcting values during cloning
 *
 * @example
 *
 * ```
 * // If the value is a Date instance, convert it to an ISO string
 * (value) => value instanceof Date ? value.toISOString() : value
 * ```
 */
export type ClonerValueProcesser = (value: any) => any;

/**
 * Clone options
 */
export interface ClonerOptions {
  /**
   * Key & Value Processor at Clone
   * @note Note that the order of execution of this processor is after the {@link ClonerOptions.valueProcesser valueProcesser}
   * @see {@link ClonerKeyProcesser}
   */
  keyProcesser?: ClonerKeyProcesser;
  /**
   * Value Processor at Clone
   * @see {@link ClonerValueProcesser}
   */
  valueProcesser?: ClonerValueProcesser;
}

/**
 * Cloning function
 */
export type CloneFn<T = any> = (obj: T) => T;

/**
 * Generate clone function
 *
 * @param opts - Clone options
 * @returns Cloning function
 */
export function Cloner(opts: ClonerOptions = {}) {
  const { keyProcesser, valueProcesser } = opts;
  const refs: any[] = [];
  const refsNew: any[] = [];

  return clone;

  function cloneArray<T = any>(array: T[], fn: (cursor: any) => any[]) {
    const keys = Object.keys(array);
    const { length } = keys;
    const clonedArray = new Array(length);
    for (let i = 0; i < length; i++) {
      const key: any = keys[i];
      let cursor = array[key];
      if (valueProcesser) {
        cursor = valueProcesser(cursor);
      }
      if (typeof cursor !== 'object' || cursor === null) {
        clonedArray[key] = cursor;
      } else if (cursor instanceof Date) {
        clonedArray[key] = new Date(cursor);
      } else if (isArrayBufferView(cursor)) {
        clonedArray[key] = copyBuffer(cursor);
      } else {
        const index = refs.indexOf(cursor);
        if (index !== -1) {
          clonedArray[key] = refsNew[index];
        } else {
          clonedArray[key] = fn(cursor);
        }
      }
    }
    return clonedArray;
  }

  function clone<T = any>(obj: T): T {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (obj instanceof Date) return new Date(obj) as any;
    if (Array.isArray(obj)) return cloneArray(obj, clone) as any;
    if (isMap(obj)) return new Map(cloneArray(Array.from(obj), clone)) as any;
    if (isSet(obj)) return new Set(cloneArray(Array.from(obj), clone)) as any;
    const clonedObj: any = {};
    refs.push(obj);
    refsNew.push(clonedObj);
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key) === false) continue;
      let cursor = obj[key];
      if (valueProcesser) {
        cursor = valueProcesser(cursor);
      }
      if (keyProcesser) {
        cursor = keyProcesser(key, cursor);
      }
      if (typeof cursor !== 'object' || cursor === null) {
        clonedObj[key] = cursor;
      } else if (cursor instanceof Date) {
        clonedObj[key] = new Date(cursor);
      } else if (isMap(cursor)) {
        clonedObj[key] = new Map(cloneArray(Array.from(cursor), clone));
      } else if (isSet(cursor)) {
        clonedObj[key] = new Set(cloneArray(Array.from(cursor), clone));
      } else if (isArrayBufferView(cursor)) {
        clonedObj[key] = copyBuffer(cursor);
      } else {
        const i = refs.indexOf(cursor);
        if (i !== -1) {
          clonedObj[key] = refsNew[i];
        } else {
          clonedObj[key] = clone(cursor);
        }
      }
    }
    refs.pop();
    refsNew.pop();
    return clonedObj;
  }
}

export const clone = Cloner();
