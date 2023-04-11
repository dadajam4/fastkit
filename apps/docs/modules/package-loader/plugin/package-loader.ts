import type { Plugin } from 'vite';
import {
  loadPackages,
  extractGetPackageProviderName,
  extractGetPackageName,
  loadPackage,
  loadPackageProvider,
} from './utils';
import {
  GET_PACKAGES_ID,
  GET_PACKAGE_PROVIDER_PREFIX,
  GET_PACKAGE_PREFIX,
} from './constants';

export function PackageLoader(): Plugin {
  return {
    name: 'vite-package-loader',
    enforce: 'pre',
    resolveId(id, importer) {
      if (
        id === GET_PACKAGES_ID ||
        id.startsWith(GET_PACKAGE_PREFIX) ||
        id.startsWith(GET_PACKAGE_PROVIDER_PREFIX)
      ) {
        return id;
      }

      // if (importer?.startsWith(GET_PACKAGE_PROVIDER_PREFIX)) {
      //   return path.join(PROVIDER_TEMPLATE_DIR, id);
      // }

      return null;
    },
    async load(id) {
      if (id === GET_PACKAGES_ID) {
        return loadPackages();
      }

      const providerName = extractGetPackageProviderName(id);
      if (providerName) {
        return loadPackageProvider(providerName);
      }

      const pkgName = extractGetPackageName(id);

      if (!pkgName) return null;

      return loadPackage(pkgName);
    },
  };
}
