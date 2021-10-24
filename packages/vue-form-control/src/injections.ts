import { InjectionKey, inject } from 'vue';
import type { FormNodeControl } from './composables/node';
import type { FormSelectorControl } from './composables/selector';
import type { FormSelectorItemGroupControl } from './composables/selector-item-group';
import type { VueForm } from './composables/form';

export const FormNodeInjectionKey: InjectionKey<FormNodeControl | null> =
  Symbol();

export const FormSelectorInjectionKey: InjectionKey<FormSelectorControl | null> =
  Symbol();

export const FormSelectorItemGroupInjectionKey: InjectionKey<FormSelectorItemGroupControl | null> =
  Symbol();

export const FormInjectionKey: InjectionKey<VueForm | null> = Symbol();

export function useParentForm() {
  return inject(FormInjectionKey, null);
}
