import { inject } from 'vue';
import { VStackRootInjectKey } from '../components/VStackRoot';
import { VueStackError } from '../logger';

export function useStackRoot() {
  const rootControl = inject(VStackRootInjectKey);
  if (!rootControl) {
    throw new VueStackError('missing vue stack root.');
  }
  return rootControl;
}
