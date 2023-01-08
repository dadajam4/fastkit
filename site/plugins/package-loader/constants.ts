import { ROOT_DIR } from '../../../core/utils';
import path from 'node:path';

export const GET_PACKAGE_PREFIX = 'virtual:package:';

export const GET_PACKAGE_PROVIDER_PREFIX = 'virtual:package-provider:';

export const GET_PACKAGES_ID = 'virtual:packages';

export const PROVIDER_TEMPLATE_DIR = ROOT_DIR.join(
  'site/src/composables/package/components/VPackageProvider',
);

export const PROVIDER_TEMPLATE_PATH = path.join(
  PROVIDER_TEMPLATE_DIR,
  '_provider-template.ts',
);
