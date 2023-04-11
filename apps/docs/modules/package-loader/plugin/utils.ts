import type { LoadResult } from 'rollup';
import {
  getWorkspacePackageJson,
  findWorkspacePackages,
} from '@fastkit/plugboy';
import {
  PACKAGES_DIR,
  GET_PACKAGE_PREFIX,
  GET_PACKAGE_PROVIDER_PREFIX,
  PROVIDER_TEMPLATE_PATH,
  MODULES_ROOT,
} from './constants';
import fs from 'fs-extra';
import path from 'node:path';
import { FastkitPackage, PackageDep, PackageInfo } from '../schemes';

export function toLoadResult(source: string | Record<string, any>): LoadResult {
  const chunk = JSON.stringify(source);
  const code = `export default ${chunk};`;
  return {
    code,
  };
}

export async function loadPackage(packageName: string): Promise<LoadResult> {
  const pkg = await getWorkspacePackageJson(
    path.join(PACKAGES_DIR, packageName),
  );
  return toLoadResult(toPackageInfo(pkg.json));
}

export async function getPackages(): Promise<PackageInfo[]> {
  const packages = (await findWorkspacePackages(PACKAGES_DIR)).map(
    (pkg) => pkg.json as FastkitPackage,
  );
  const filteredPkgs = packages
    .filter((pkg) => !!pkg._docs)
    .map((pkg) => toPackageInfo(pkg));
  return filteredPkgs;
}

export async function loadPackages(): Promise<LoadResult> {
  const packages = await getPackages();
  return toLoadResult(packages);
}

export function extractGetPackageProviderName(id: string) {
  if (!id.startsWith(GET_PACKAGE_PROVIDER_PREFIX)) return;
  return id.replace(GET_PACKAGE_PROVIDER_PREFIX, '');
}

export function extractGetPackageName(id: string) {
  if (!id.startsWith(GET_PACKAGE_PREFIX)) return;
  return id.replace(GET_PACKAGE_PREFIX, '');
}

export async function loadPackageProvider(
  packageName: string,
): Promise<LoadResult> {
  const template = await fs.readFile(PROVIDER_TEMPLATE_PATH, 'utf-8');
  const code = template
    .replace(/__PACKAGE_NAME__/g, packageName)
    .replace(/ from '@@\//g, ` from '${MODULES_ROOT}/`);

  return {
    code,
    map: '',
  };
}

function toDeps(source: Record<string, string> = {}): PackageDep[] {
  return Object.entries(source).map(([name, version]) => ({ name, version }));
}

export function toPackageInfo(source: FastkitPackage): PackageInfo {
  const {
    name: fullName,
    version,
    repository,
    homepage,
    keywords = [],
    devDependencies,
    dependencies,
    peerDependencies,
    _docs = { description: {} },
  } = source;
  const name = fullName.replace('@fastkit/', '');
  const { displayName = name, scope, feature, description = {} } = _docs;

  return {
    name,
    displayName,
    fullName,
    scope,
    feature,
    description,
    version,
    repository,
    homepage,
    keywords,
    devDependencies: toDeps(devDependencies),
    dependencies: toDeps(dependencies),
    peerDependencies: toDeps(peerDependencies),
  };
}
