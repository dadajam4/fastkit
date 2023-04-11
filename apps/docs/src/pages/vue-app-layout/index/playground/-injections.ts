import { InjectionKey } from 'vue';
import type { PlaygroundContext } from './-context';

export const PLAYGROUND_CONTEXT_INJECTION_KEY: InjectionKey<PlaygroundContext> =
  Symbol();
