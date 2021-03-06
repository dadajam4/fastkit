import path from 'path';
import fs from 'fs-extra';
import { pathExists, pathExistsSync } from './path';
import execa from 'execa';
import { NodeUtilError } from './logger';

const DEV_RE = /\/fastkit\/packages\//;

export async function isAvairableModuleDir(dir: string) {
  if (!(await pathExists(dir, 'dir'))) return false;
  const files = await fs.readdir(dir);
  return files.filter((file) => !file.startsWith('.')).length > 0;
}

export function isAvairableModuleDirSync(dir: string) {
  if (!pathExistsSync(dir, 'dir')) return false;
  const files = fs.readdirSync(dir);
  return files.filter((file) => !file.startsWith('.')).length > 0;
}

export async function findPackageDir(
  from: string = process.cwd(),
  requireModuleDirectory = false,
): Promise<string | undefined> {
  if (DEV_RE.test(from)) {
    return path.join(from, '../..');
  }

  let result: string | undefined;

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
          (await isAvairableModuleDir(path.join(from, 'node_modules')))
        ) {
          result = from;
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
  from: string = process.cwd(),
  requireModuleDirectory = false,
): string | undefined {
  if (DEV_RE.test(from)) {
    return path.join(from, '../..');
  }

  let result: string | undefined;

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
          isAvairableModuleDirSync(path.join(from, 'node_modules'))
        ) {
          result = from;
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

async function getTypeofLockFile(
  cwd?: string,
): Promise<PackageManagerName | null> {
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

  return Promise.all([
    pathExists(path.resolve(cwd, 'yarn.lock')),
    pathExists(path.resolve(cwd, 'package-lock.json')),
    pathExists(path.resolve(cwd, 'pnpm-lock.yaml')),
  ]).then(([isYarn, isNpm, isPnpm]) => {
    let value: PackageManagerName | null = null;

    if (isYarn) {
      value = 'yarn';
    } else if (isPnpm) {
      value = 'pnpm';
    } else if (isNpm) {
      value = 'npm';
    }

    detectPMCache.set(key, value);
    return value;
  });
}

export async function detectPackageManager({ cwd }: { cwd?: string } = {}) {
  const type = await getTypeofLockFile(cwd);
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
  const args = [pkg, installCommand];
  if (dev) {
    args.push('-D');
  }

  const res = await execa(pm, args, { cwd: pkgDir });
  if (res.stderr) {
    throw new NodeUtilError(res.stderr);
  }
  return installedDir;
}
