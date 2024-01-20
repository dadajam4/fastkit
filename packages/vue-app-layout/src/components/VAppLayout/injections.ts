import { InjectionKey, inject, provide } from 'vue';

const VAL_PROVIDE_VALUE = Symbol('VAL_VALUE');

const VAL_PROVIDE_KEY: InjectionKey<typeof VAL_PROVIDE_VALUE> = Symbol('VAL');

export function hasParentLayout() {
  return !!inject(VAL_PROVIDE_KEY, null);
}

export function provideLayout() {
  provide(VAL_PROVIDE_KEY, VAL_PROVIDE_VALUE);
}
