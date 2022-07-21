import { InjectionKey, inject, provide } from 'vue';
import type { VDocsSectionContext } from './context';

export const DOCS_SECTION_INJECTION_KEY: InjectionKey<VDocsSectionContext> =
  Symbol();

export function useParentDocsSection() {
  return inject(DOCS_SECTION_INJECTION_KEY, null);
}

export function provideDocsSection(ctx: VDocsSectionContext) {
  return provide(DOCS_SECTION_INJECTION_KEY, ctx);
}
