import { InjectionKey } from 'vue';
import type { VueStackService } from './service';

export const VueStackInjectionKey: InjectionKey<VueStackService> =
  Symbol('VueStack');

export const V_STACK_CONTAINER_CLASS = 'v-stack-container';
