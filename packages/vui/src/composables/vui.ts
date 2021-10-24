import { inject, computed, ComputedRef, provide } from 'vue';
import { VuiInjectionKey, VuiColorProviderInjectionKey } from '../injections';
export type { VuiService } from '../service';
import { ScopeName } from '@fastkit/color-scheme';

export function useVui() {
  const vui = inject(VuiInjectionKey);
  if (!vui) {
    throw new Error('missing vui service');
  }
  return vui;
}

export interface VuiColorProvider {
  primary: ComputedRef<ScopeName>;
  error: ComputedRef<ScopeName>;
  className: (type: 'primary' | 'error') => string;
}

export function useVuiColorProvider(): VuiColorProvider {
  const parent = inject(VuiColorProviderInjectionKey, null);
  if (parent) {
    return parent;
  }

  const vui = useVui();
  const primary = computed(() => vui.color('primary'));
  const error = computed(() => vui.color('error'));
  const provider: VuiColorProvider = {
    primary,
    error,
    className: (type) => {
      const scope = provider[type].value;
      return `${scope}-scope`;
    },
  };

  provide(VuiColorProviderInjectionKey, provider);

  return provider;
}
