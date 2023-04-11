import { InjectionKey } from 'vue';
import type { VueStackService } from './service';
import type { VStackRootControl } from './components';

export const VueStackInjectionKey: InjectionKey<VueStackService> = Symbol();

export const VStackRootInjectKey: InjectionKey<VStackRootControl> = Symbol();
