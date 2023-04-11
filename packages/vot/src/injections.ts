import { inject, App } from 'vue';
import type { VotContext } from './schemes';

const CONTEXT_SYMBOL = Symbol();
export function provideContext(app: App, context: VotContext) {
  app.provide(CONTEXT_SYMBOL, context);
}

export function useContext() {
  return inject(CONTEXT_SYMBOL) as VotContext;
}
