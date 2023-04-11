import { inject } from 'vue';
import { VueStackInjectionKey } from '../injections';
import { VueStackError } from '../logger';

export function useVueStack() {
  const $vstack = inject(VueStackInjectionKey);
  if (!$vstack) {
    throw new VueStackError('missing vue stack service.');
  }
  return $vstack;
}
