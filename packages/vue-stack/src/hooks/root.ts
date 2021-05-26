import { inject } from 'vue';
import { VStackRootInjectKey } from '../injections';
import { VueStackError } from '../logger';

export function useStackRoot() {
  const rootControl = inject(VStackRootInjectKey);
  if (!rootControl) {
    throw new VueStackError('missing vue stack root.');
  }
  return rootControl;
}
