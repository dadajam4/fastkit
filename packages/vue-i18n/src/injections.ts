import { InjectionKey } from 'vue';
import { I18nSpace } from '@fastkit/i18n';

/**
 * Symbol key to inject instantiated internationalization space
 * @internal
 */
export const VUE_I18N_INJECTION_KEY: InjectionKey<
  I18nSpace<any, any, any, any>
> = Symbol();
