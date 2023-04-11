import { InjectionKey } from 'vue';
import type { PackageProvide } from './package-provide';

export const PACKAGE_PROVIDE_INJECTION_KEY: InjectionKey<PackageProvide> =
  Symbol();
