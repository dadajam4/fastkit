import path from 'node:path';
import { getDirname } from '@fastkit/node-util';

const __diranme = getDirname(import.meta.url);

export const MODULES_ROOT = path.resolve(__diranme, '../..');

export const MODULE_ROOT = path.resolve(__diranme, '..');

export const DOCS_ROOT = path.resolve(MODULE_ROOT, '../..');

export const PROJECT_ROOT = path.resolve(DOCS_ROOT, '../..');

export const PACKAGES_DIR = path.join(PROJECT_ROOT, 'packages');

export const GET_PACKAGE_PREFIX = 'virtual:package:';

export const GET_PACKAGE_PROVIDER_PREFIX = 'virtual:package-provider:';

export const GET_PACKAGES_ID = 'virtual:packages';

export const PROVIDER_TEMPLATE_DIR = path.join(
  MODULE_ROOT,
  'components/VPackageProvider',
);

export const PROVIDER_TEMPLATE_PATH = path.join(
  PROVIDER_TEMPLATE_DIR,
  '_provider-template.ts',
);
