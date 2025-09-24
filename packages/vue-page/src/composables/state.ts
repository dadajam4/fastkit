import { inject, provide } from 'vue';

export type StateInjectionKey<T extends object> = string;

export function useState<T extends object>(key: StateInjectionKey<T>): T | undefined; // eslint-disable-line prettier/prettier
export function useState<T extends object>(key: StateInjectionKey<T>, defaultValue: T | (() => T)): T; // eslint-disable-line prettier/prettier
export function useState<T extends object>(
  key: StateInjectionKey<T>,
  defaultValue?: T | (() => T),
): T | undefined {
  return inject(key as any, defaultValue, true) as any;
}

export function provideState<T extends object>(
  key: StateInjectionKey<T>,
  value: T,
) {
  return provide(key as any, value);
}
