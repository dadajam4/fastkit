import { InjectionKey } from 'vue';
import type { VueStackService } from './service';

export const VueStackInjectionKey: InjectionKey<VueStackService> = Symbol();

export const V_STACK_CONTAINER_ID = 'v-stack-container';
