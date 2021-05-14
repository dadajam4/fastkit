import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import execa from 'execa';
import { FastkitPackage } from './schemes';

class PathString extends String {
  get path() {
    return this.toString();
  }
  join(...args: string[]) {
    return path.join(this.path, ...args);
  }
  resolve(...args: string[]) {
    return path.resolve(this.path, ...args);
  }
}

export const ROOT_DIR = new PathString(path.resolve(__dirname, '..'));

export const PACKAGES_DIR = new PathString(ROOT_DIR.join('packages'));

export function getPackage(
  packagePath = ROOT_DIR.join('package.json'),
): FastkitPackage {
  try {
    return require(packagePath);
  } catch (err) {
    throw err;
  }
}

export async function findPackage(
  from: string,
): Promise<FastkitPackage | undefined> {
  let result: FastkitPackage | undefined;

  if (await pathExists(from, 'file')) {
    from = path.dirname(from);
  }

  while (true) {
    const target = path.join(from, 'package.json');
    try {
      const pkg = require(target);
      if (pkg) {
        result = pkg;
        break;
      }
    } catch (err) {
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

export async function pathExists(filepath: string, type?: 'file' | 'dir') {
  try {
    const stat = await fs.stat(filepath);
    if (type === 'file') return stat.isFile();
    if (type === 'dir') return stat.isDirectory();
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

export const targets = (exports.targets = fs
  .readdirSync(PACKAGES_DIR.path)
  .filter((f) => {
    if (!fs.statSync(PACKAGES_DIR.join(f)).isDirectory()) {
      return false;
    }

    try {
      const pkg = require(PACKAGES_DIR.join(f, 'package.json'));
      if (pkg.private && !pkg.buildOptions) {
        return false;
      }
    } catch (err) {
      throw err;
    }
    return true;
  }));

export function getCommit() {
  try {
    return execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7);
  } catch (err) {
    return '';
  }
}

export function fuzzyMatchTarget(
  partialTargets: string[],
  includeAllMatching?: boolean,
) {
  const matched: string[] = [];
  partialTargets.forEach((partialTarget) => {
    for (const target of targets) {
      if (target.match(partialTarget)) {
        matched.push(target);
        if (!includeAllMatching) {
          break;
        }
      }
    }
  });
  if (matched.length) {
    return matched;
  } else {
    console.log();
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `Target ${chalk.underline(partialTargets)} not found!`,
      )}`,
    );
    console.log();

    process.exit(1);
  }
}