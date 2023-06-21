import { InjectionKey, inject } from 'vue';
import type { FormNodeControl } from './composables/node';
import type { FormSelectorControl } from './composables/selector';
import type { FormSelectorItemGroupControl } from './composables/selector-item-group';
import type { VueForm } from './composables/form';
import type { VueFormService } from './service';
import { VueFormControlError } from './logger';

export const FormNodeInjectionKey: InjectionKey<FormNodeControl | null> =
  Symbol('FormNodeControl');

export const FormSelectorInjectionKey: InjectionKey<FormSelectorControl | null> =
  Symbol('FormSelectorControl');

export const FormSelectorItemGroupInjectionKey: InjectionKey<FormSelectorItemGroupControl | null> =
  Symbol('FormSelectorItemGroupControl');

export const FormInjectionKey: InjectionKey<VueForm | null> = Symbol('VueForm');

export function useParentForm() {
  return inject(FormInjectionKey, null);
}

export const FormServiceInjectionKey: InjectionKey<VueFormService> =
  Symbol('VueFormService');

export function useVueForm() {
  const service = inject(FormServiceInjectionKey);
  if (!service) {
    throw new VueFormControlError('missing provided VueFormService');
  }
  return service;
}
