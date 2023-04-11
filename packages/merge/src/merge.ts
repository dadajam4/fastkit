/* eslint-disable @typescript-eslint/ban-types */
import { isNonNullObject } from '@fastkit/helpers';

interface AnyObject {
  [key: string | number | symbol]: any;
}

function isSpecial<T>(value: T) {
  const stringValue = Object.prototype.toString.call(value);

  return stringValue === '[object RegExp]' || stringValue === '[object Date]';
}

function isMergeableObject(value: unknown) {
  return isNonNullObject(value) && !isSpecial(value);
}

function emptyTarget(val: unknown): any {
  return Array.isArray(val) ? [] : {};
}

export interface DeepMergeOptions {
  arrayMerge?(target: any[], source: any[], options?: DeepMergeOptions): any[];
  clone?: boolean;
  customMerge?: (
    key: string | number | symbol,
    options?: DeepMergeOptions,
  ) => ((x: any, y: any) => any) | undefined;
  isMergeableObject?(value: unknown): boolean;
}

export interface ResolvedDeepMergeOptions
  extends Omit<DeepMergeOptions, 'isMergeableObject'>,
    Required<Pick<DeepMergeOptions, 'isMergeableObject'>> {
  cloneUnlessOtherwiseSpecified: <T>(
    value: T,
    options: ResolvedDeepMergeOptions,
  ) => T;
}

function cloneUnlessOtherwiseSpecified<T>(
  value: T,
  options: ResolvedDeepMergeOptions,
): T {
  return options.clone !== false && options.isMergeableObject(value)
    ? deepmerge(emptyTarget(value), value, options)
    : value;
}

function defaultArrayMerge<T>(
  target: T[],
  source: T[],
  options: ResolvedDeepMergeOptions,
) {
  return target
    .concat(source)
    .map((element) => cloneUnlessOtherwiseSpecified(element, options));
}

function getMergeFunction(
  key: string | number | symbol,
  options: ResolvedDeepMergeOptions,
) {
  if (!options.customMerge) {
    return deepmerge;
  }
  const customMerge = options.customMerge(key);
  return typeof customMerge === 'function' ? customMerge : deepmerge;
}

function getEnumerableOwnPropertySymbols(target: any) {
  return Object.getOwnPropertySymbols
    ? Object.getOwnPropertySymbols(target).filter((symbol) =>
        target.propertyIsEnumerable(symbol),
      )
    : [];
}

function getKeys(target: any) {
  return (Object.keys(target) as unknown as symbol[]).concat(
    getEnumerableOwnPropertySymbols(target),
  );
}

function propertyIsOnObject(object: any, property: string | number | symbol) {
  try {
    return property in object;
  } catch (_) {
    return false;
  }
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target: any, key: string | number | symbol) {
  return (
    propertyIsOnObject(target, key) && // Properties are safe to merge if they don't exist in the target yet,
    !(
      Object.hasOwnProperty.call(target, key) && // unsafe if they exist up the prototype chain,
      Object.propertyIsEnumerable.call(target, key)
    )
  ); // and also unsafe if they're nonenumerable.
}

export function mergeObject<T1 extends AnyObject, T2 extends AnyObject>(
  target: T1,
  source: T2,
  options: ResolvedDeepMergeOptions,
): T1 & T2 {
  const destination: { [key: symbol]: any } = {};
  if (options.isMergeableObject(target)) {
    getKeys(target).forEach(function (key) {
      destination[key] = cloneUnlessOtherwiseSpecified(
        (target as any)[key],
        options,
      );
    });
  }
  getKeys(source).forEach(function (key) {
    if (propertyIsUnsafe(target, key)) {
      return;
    }

    if (
      propertyIsOnObject(target, key) &&
      options.isMergeableObject(source[key])
    ) {
      destination[key] = getMergeFunction(key, options)(
        target[key],
        source[key],
        options,
      );
    } else {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    }
  });
  return destination as T1 & T2;
}

export function deepmerge<T>(
  x: Partial<T>,
  y: Partial<T>,
  options?: DeepMergeOptions,
): T;

export function deepmerge<T1, T2>(
  x: Partial<T1>,
  y: Partial<T2>,
  options?: DeepMergeOptions,
): T1 & T2;

export function deepmerge<T1, T2>(
  target: T1,
  source: T2,
  options?: DeepMergeOptions,
) {
  const _options: ResolvedDeepMergeOptions = {
    ...(options as ResolvedDeepMergeOptions),
    cloneUnlessOtherwiseSpecified,
  };

  _options.arrayMerge = _options.arrayMerge || defaultArrayMerge;
  _options.isMergeableObject = _options.isMergeableObject || isMergeableObject;

  const sourceIsArray = Array.isArray(source);
  const targetIsArray = Array.isArray(target);
  const sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, _options);
  } else if (sourceIsArray) {
    return _options.arrayMerge(target as unknown as any[], source, _options);
  } else {
    // @FIXME
    return mergeObject(target as any, source as any, _options);
  }
}

deepmerge.all = function deepmergeAll<T>(
  array: Partial<T>[],
  options?: DeepMergeOptions,
): T extends Array<infer U> ? U : never {
  if (!Array.isArray(array)) {
    throw new Error('first argument should be an array');
  }

  return array.reduce(
    (prev, next) => deepmerge(prev, next, options),
    {},
  ) as any;
};
