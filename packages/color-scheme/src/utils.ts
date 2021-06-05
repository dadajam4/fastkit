import { Bucket } from './schemes/bucket';
import { ColorScopeOptionalKey, ColorScopeResolvers } from './schemes';
import { ColorSchemeError } from './logger';

export function createBucket<RN, T, G, C, J, I extends Bucket<RN, T, G, C, J>>(
  modelName: string,
  values: (push: (value: T) => number, instance: I) => void,
  ctx: C,
  _getter: (value: T) => G,
  _toJSON: (values: T[]) => J,
): I {
  const _values: T[] = [];
  const instance: I = function getter(name: RN): G {
    const value = _values.find((value) => (value as any).name === name);
    if (!value) {
      throw new ColorSchemeError(`${modelName}: missing color "${name}"`);
    }
    return _getter(value);
  } as unknown as I;
  instance[Symbol.iterator] = function () {
    return _values[Symbol.iterator]();
  };
  (instance as any).ctx = ctx;
  instance.toJSON = function toJSON() {
    return _toJSON(_values);
  };
  (
    [
      'toString',
      'toLocaleString',
      'indexOf',
      'lastIndexOf',
      'every',
      'some',
      'forEach',
      'map',
      'filter',
      'reduce',
      'reduceRight',
    ] as const
  ).forEach((funcName) => {
    const func = function (...args: any[]) {
      return (_values as any)[funcName](...args);
    };
    instance[funcName] = func;
  });
  function push(value: T) {
    return _values.push(value);
  }

  values(push, instance);
  return instance;
}

export function mergeScopeResolverMaps<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorScopeResolvers<TN, PN, SN, VN, OK>,
>(optionals: OK[], ...resolverMaps: T[]): T {
  const merged: any = {};
  resolverMaps.forEach((map) => {
    optionals.forEach((optional) => {
      const func = (map as any)[optional];
      if (func === undefined) return;
      if (func) {
        merged[optional] = func;
      } else {
        delete merged[optional];
      }
    });
  });
  return merged;
}
