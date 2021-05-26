import { InjectionKey } from 'vue';
import type { VueColorSchemeService } from './service';

export const VueColorSchemeInjectionKey: InjectionKey<VueColorSchemeService> =
  Symbol();
