import path from 'node:path';
import fs from 'fs-extra';
import { pathExists, pathExistsSync } from './path';
import { execa } from 'execa';
import { NodeUtilError } from './logger';
import module from 'node:module';
const require = module.createRequire(import.meta.url);

const DEV_RE = /\/fastkit\/packages\//;

export async function isAvailableModuleDir(dir: string) {
  if (!(await pathExists(dir, 'dir'))) return false;
  const files = await fs.readdir(dir);
  return files.filter((file) => !file.startsWith('.')).length > 0;
}

export function isAvailableModuleDirSync(dir: string) {
  if (!pathExistsSync(dir, 'dir')) return false;
  const files = fs.readdirSync(dir);
  return files.filter((file) => !file.startsWith('.')).length > 0;
}

/**
 * Mock interface of package.json
 */
export interface PackageMetadata {
  [key: string]: unknown;
}

export interface FindPackageResult {
  data: PackageMetadata;
  dir: string;
}

export async function findPackage(
  from: string = process.cwd(),
  requireModuleDirectory = false,
): Promise<FindPackageResult | undefined> {
  if (DEV_RE.test(from)) {
    from = path.join(from, '../..');
    const pkg = require(path.join(from, 'package.json'));
    return {
      data: pkg,
      dir: from,
    };
  }

  let result: FindPackageResult | undefined;

  if (await pathExists(from, 'file')) {
    from = path.dirname(from);
  }

  while (true) {
    const target = path.join(from, 'package.json');
    try {
      const pkg = require(target);
      if (pkg) {
        if (
          !requireModuleDirectory ||
          (await isAvailableModuleDir(path.join(from, 'node_modules')))
        ) {
          result = {
            data: pkg,
            dir: from,
          };
          break;
        }
      }
    } catch (err: any) {
      if (!err.message.startsWith('Cannot find module')) {
        throw err;
      }
    }
    const next = path.dirname(from);
    if (next === from) {
      break;
    }
    from = next;
  }
  return result;
}

export function findPackageDir(
  from?: string,
  requireModuleDirectory?: boolean,
): Promise<string | undefined> {
  return findPackage(from, requireModuleDirectory).then(
    (result) => result?.dir,
  );
}

export function findPackageSync(
  from: string = process.cwd(),
  requireModuleDirectory = false,
): FindPackageResult | undefined {
  if (DEV_RE.test(from)) {
    from = path.join(from, '../..');
    const pkg = require(path.join(from, 'package.json'));
    return {
      data: pkg,
      dir: from,
    };
  }

  let result: FindPackageResult | undefined;

  if (pathExistsSync(from, 'file')) {
    from = path.dirname(from);
  }

  while (true) {
    const target = path.join(from, 'package.json');
    try {
      const pkg = require(target);
      if (pkg) {
        if (
          !requireModuleDirectory ||
          isAvailableModuleDirSync(path.join(from, 'node_modules'))
        ) {
          result = {
            data: pkg,
            dir: from,
          };
          break;
        }
      }
    } catch (err: any) {
      if (!err.message.startsWith('Cannot find module')) {
        throw err;
      }
    }
    const next = path.dirname(from);
    if (next === from) {
      break;
    }
    from = next;
  }
  return result;
}

export function findPackageDirSync(
  from?: string,
  requireModuleDirectory?: boolean,
): string | undefined {
  return findPackageSync(from, requireModuleDirectory)?.dir;
}

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm';

const detectPMCache = new Map();

/**
 * Check if a global pm is available
 */
function hasGlobalPackageManagerInstallation(
  pm: PackageManagerName,
): Promise<boolean> {
  const key = `has_global_${pm}`;
  if (detectPMCache.has(key)) {
    return Promise.resolve(detectPMCache.get(key));
  }

  return execa(pm, ['--version'])
    .then((res) => {
      return /^\d+.\d+.\d+$/.test(res.stdout);
    })
    .then((value) => {
      detectPMCache.set(key, value);
      return value;
    });
}

export interface GetTypeofLockFileOptions {
  cwd?: string;
  /**
   * @default true
   */
  recursive?: boolean;
}

export async function getTypeofLockFile(
  cwdOrOptions?: string | GetTypeofLockFileOptions,
): Promise<PackageManagerName | null> {
  const opts =
    typeof cwdOrOptions === 'object' ? cwdOrOptions : { cwd: cwdOrOptions };
  let { cwd } = opts;
  const { recursive = true } = opts;
  if (!cwd) {
    cwd = await findPackageDir(undefined, true);
  }
  if (!cwd) {
    cwd = '.';
  }
  const key = `lockfile_${cwd}`;
  if (detectPMCache.has(key)) {
    return Promise.resolve(detectPMCache.get(key));
  }

  const [isYarn, isNpm, isPnpm] = await Promise.all([
    pathExists(path.resolve(cwd, 'yarn.lock')),
    pathExists(path.resolve(cwd, 'package-lock.json')),
    pathExists(path.resolve(cwd, 'pnpm-lock.yaml')),
  ]);

  let value: PackageManagerName | null = null;

  if (isYarn) {
    value = 'yarn';
  } else if (isPnpm) {
    value = 'pnpm';
  } else if (isNpm) {
    value = 'npm';
  }

  if (!value && recursive) {
    const parentPkgDir = await findPackageDir(path.resolve(cwd, '..'), true);
    if (parentPkgDir) {
      return getTypeofLockFile(parentPkgDir);
    }
  }

  detectPMCache.set(key, value);
  return value;
}

export async function detectPackageManager(
  cwdOrOptions?: string | GetTypeofLockFileOptions,
) {
  const type = await getTypeofLockFile(cwdOrOptions);
  if (type) {
    return type;
  }
  const [hasYarn, hasPnpm] = await Promise.all([
    hasGlobalPackageManagerInstallation('yarn'),
    hasGlobalPackageManagerInstallation('pnpm'),
  ]);
  if (hasYarn) {
    return 'yarn';
  }
  if (hasPnpm) {
    return 'pnpm';
  }
  return 'npm';
}

export async function installPackage(
  pkg: string,
  {
    dev = false,
    skipWhenInstalled = true,
  }: {
    dev?: boolean;
    skipWhenInstalled?: boolean;
  } = {},
) {
  const pkgDir = await findPackageDir(undefined, true);
  if (!pkgDir) {
    throw new NodeUtilError('missing package directory.');
  }
  const installedDir = path.join(pkgDir, 'node_modules', pkg);

  if (skipWhenInstalled) {
    if (await pathExists(installedDir, 'dir')) {
      // logger.info(`${pkg} is already installed. skip install.`);
      return installedDir;
    }
  }

  const pm = await detectPackageManager();
  const installCommand = pm === 'npm' ? 'install' : 'add';
  const args = [installCommand, pkg];
  if (dev) {
    args.push('-D');
  }

  const res = await execa(pm, args, { cwd: pkgDir });
  if (res.stderr) {
    throw new NodeUtilError(res.stderr);
  }
  return installedDir;
}

export function inferPackageFormat(
  cwd: string,
  filename?: string,
): 'esm' | 'cjs' {
  if (filename) {
    if (filename.endsWith('.mjs')) {
      return 'esm';
    }
    if (filename.endsWith('.cjs')) {
      return 'cjs';
    }
  }
  const pkg = findPackageSync(cwd);
  return pkg?.data.type === 'module' ? 'esm' : 'cjs';
}
