import { InjectionKey } from 'vue';
import type { PMScript } from './pm-script';

export const PM_SCRIPT_INJECTION_KEY: InjectionKey<PMScript> =
  Symbol('PMScript');
