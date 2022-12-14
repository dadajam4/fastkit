import { InjectionKey, inject } from 'vue';
import { I18nSpace } from '@fastkit/i18n';
import { VueI18nError } from './logger';

/**
 * Symbol key to inject instantiated internationalization space
 * @internal
 */
export const VUE_I18N_INJECTION_KEY: InjectionKey<
  I18nSpace<any, any, any, any, any>
> = Symbol();

/**
 * Obtaining Provided Internationalization Space
 * @returns Provided Internationalization Space
 */
export function useI18nSpace<
  StrategyCustomInterface extends { [key in keyof any]: any } = {},
>(): I18nSpace<any, any, any, any, StrategyCustomInterface> {
  const space = inject(VUE_I18N_INJECTION_KEY);
  if (!space) {
    throw new VueI18nError('missing provided i18n space');
  }
  return space;
}
