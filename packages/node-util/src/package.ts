import path from 'path';
import { pathExists } from './path';
import execa from 'execa';
import { logger, NodeUtilError } from './logger';

export async function findPackageDir(
  from: string = process.cwd(),
): Promise<string | undefined> {
  let result: string | undefined;

  if (await pathExists(from, 'file')) {
    from = path.dirname(from);
  }

  while (true) {
    const target = path.join(from, 'package.json');
    try {
      const pkg = require(target);
      if (pkg) {
        result = from;
        break;
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
    cwd = await findPackageDir();
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
  const pkgDir = await findPackageDir();
  if (!pkgDir) {
    throw new NodeUtilError('missing package directory.');
  }
  const installedDir = path.join(pkgDir, 'node_modules', pkg);

  if (skipWhenInstalled) {
    if (await pathExists(installedDir, 'dir')) {
      logger.info(`${pkg} is already installed. skip install.`);
      return installedDir;
    }
  }

  const pm = await detectPackageManager();
  const installCommand = pm === 'npm' ? 'install' : 'add';
  const args = [installCommand];
  if (dev) {
    args.push('-D');
  }

  const res = await execa(pm, args, { cwd: pkgDir });
  if (res.stderr) {
    throw new NodeUtilError(res.stderr);
  }
  return installedDir;
}
