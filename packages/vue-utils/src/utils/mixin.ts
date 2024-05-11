import { type Ref, toValue } from 'vue';
import { type Mixin, arrayUnique } from '@fastkit/helpers';
import { type UnionToIntersection } from '@fastkit/ts-type-utils';

export type RefOrGetterOrValue<T> = T | Ref<T> | (() => T);

export type MixedInRefs<T, R> =
  T extends RefOrGetterOrValue<infer Base>
    ? Base extends object
      ? R extends Array<infer U>
        ? MixedInRefs<Base, UnionToIntersection<U>>
        : R extends RefOrGetterOrValue<infer Trait>
          ? Trait extends object
            ? Mixin<Base, Trait>
            : never
          : never
      : never
    : never;

type ToValue<T> = T extends RefOrGetterOrValue<infer V> ? V : never;

const REF_MIXINS_PROXY_SYMBOL: unique symbol = Symbol('RefMixinsProxy');

export interface MixedInRefsProxyImpl<T> {
  /**
   * @internal
   */
  [REF_MIXINS_PROXY_SYMBOL]: {
    get targets(): RefOrGetterOrValue<any>[];
  };

  $extend<ER extends RefOrGetterOrValue<any>[]>(
    ...traits: ER
  ): MixedInRefsProxy<MixedInRefs<T, ER>>;
}

export type MixedInRefsProxy<T> = T & MixedInRefsProxyImpl<T>;

export function refsProxy<T extends RefOrGetterOrValue<any>>(
  base: T,
): MixedInRefsProxy<ToValue<T>>;
export function refsProxy<
  T extends RefOrGetterOrValue<any>,
  R extends RefOrGetterOrValue<any>[],
>(base: T, ...traits: R): MixedInRefsProxy<MixedInRefs<T, R>>;

/**
 * Obtain a Proxy instance mixed with multiple objects as mixins.
 *
 * The `Ref` and getter functions flatten their target values as mixins.
 *
 * @param base - Base object or Ref or getter
 * @param traits - trait objects
 * @returns Mixed-in Proxy
 */
export function refsProxy<
  T extends RefOrGetterOrValue<any>,
  R extends RefOrGetterOrValue<any>[],
>(base: T, ...traits: R): MixedInRefsProxy<MixedInRefs<T, R>> {
  const targets: RefOrGetterOrValue<any>[] = [base, ...traits].reverse();
  const __mock__ = {
    [REF_MIXINS_PROXY_SYMBOL]: targets,
  } as any;

  const findTargetByProp = (propertyKey: string | symbol) => {
    for (const target of targets) {
      const _target = toValue(target);
      if (Reflect.has(_target, propertyKey)) {
        return _target;
      }
    }
    return __mock__;
  };

  const proxy = new Proxy(__mock__, {
    get: (_target, propertyKey, receiver) => {
      const target = findTargetByProp(propertyKey);
      return Reflect.get(target, propertyKey, receiver);
    },
    set: (_target, propertyKey, newValue, receiver) => {
      const target = findTargetByProp(propertyKey);
      return Reflect.set(target, propertyKey, newValue, receiver);
    },
    has: (_target, propertyKey) =>
      targets.some((target) => Reflect.has(toValue(target), propertyKey)),
    ownKeys: (_target) =>
      arrayUnique(
        targets.map((target) => Reflect.ownKeys(toValue(target))).flat(),
      ),
    getOwnPropertyDescriptor: (_target, propertyKey) => {
      for (const target of targets) {
        const descriptor = Reflect.getOwnPropertyDescriptor(
          toValue(target),
          propertyKey,
        );
        if (descriptor) return descriptor;
      }
    },
  }) as any;
  return proxy;
}
