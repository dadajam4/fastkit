import { InjectionKey } from 'vue';
import type { DocsPackage } from './docs-package';

export const DOCS_PACKAGE_INJECTION_KEY: InjectionKey<DocsPackage> = Symbol();
