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
  if (!packagePath.endsWith('.json')) {
    packagePath = path.join(packagePath, 'package.json');
  }
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

export async function pathExists(filepath: string, type?: 'file' | 'dir') {
  try {
    const stat = await fs.stat(filepath);
    if (type === 'file') return stat.isFile();
    if (type === 'dir') return stat.isDirectory();
    return true;
  } catch (err: any) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

// export const targets = (exports.targets = fs
//   .readdirSync(PACKAGES_DIR.path)
//   .filter((f) => {
//     if (!fs.statSync(PACKAGES_DIR.join(f)).isDirectory()) {
//       return false;
//     }

//     try {
//       const pkg = require(PACKAGES_DIR.join(
//         f,
//         'package.json',
//       )) as FastkitPackage;
//       const { buildOptions } = pkg;
//       if (
//         (pkg.private && !buildOptions) ||
//         (!!buildOptions && buildOptions.ignore)
//       ) {
//         return false;
//       }
//     } catch (err) {
//       throw err;
//     }
//     return true;
//   }));
export const targets = fs.readdirSync(PACKAGES_DIR.path).filter((f) => {
  if (!fs.statSync(PACKAGES_DIR.join(f)).isDirectory()) {
    return false;
  }

  try {
    const pkg = require(PACKAGES_DIR.join(f, 'package.json')) as FastkitPackage;
    const { buildOptions } = pkg;
    if (
      (pkg.private && !buildOptions) ||
      (!!buildOptions && buildOptions.ignore)
    ) {
      return false;
    }
  } catch (err) {
    throw err;
  }
  return true;
});

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
      if (
        target === 'create-fastkit-app' &&
        partialTargets.length === 1 &&
        partialTargets[0] === 'fastkit'
      ) {
        continue;
      }
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

function getDeps(name: string) {
  const pkgDir = PACKAGES_DIR.join(name);
  const pkg = getPackage(`${pkgDir}/package.json`);
  const deps = Object.keys(pkg.dependencies || {}).filter((dep) =>
    targets.includes(dep.replace(/^@fastkit\//, '')),
  );
  const result = deps.slice();
  deps.forEach((dep) => {
    const childName = dep.replace(/^@fastkit\//, '');
    if (targets.includes(childName)) {
      const children = getDeps(childName);
      children.forEach((child) => {
        !result.includes(child) && result.push(child);
      });
    }
  });
  return result;
}

// 進行表
export interface BuildQueueNode {
  name: string;
  pkg: FastkitPackage;
  deps: string[];
  depNames: string[];
}

export type BuildQueue = BuildQueueNode[];

function getSortedBuildQueueNodes(nodes: BuildQueueNode[]) {
  const works = nodes.slice();

  let ok = false;

  while (!ok) {
    ok = true;

    for (const node of works.slice()) {
      const shiftUpFromIndex = works.indexOf(node);
      const shiftUpNodes = works.filter(
        (n, ni) => node.deps.includes(n.pkg.name) && ni > shiftUpFromIndex,
      );

      if (shiftUpNodes.length) {
        ok = false;
        shiftUpNodes.forEach((shiftUpNode) => {
          const nodeIndex = works.indexOf(node);
          const hitIndex = works.indexOf(shiftUpNode);
          works.splice(hitIndex, 1);

          const insertTo = nodeIndex - 1;
          if (insertTo < 0) {
            works.unshift(shiftUpNode);
          } else {
            works.splice(insertTo, 0, shiftUpNode);
          }
        });
        continue;
      }

      const shiftDownFromIndex = works.indexOf(node);
      const shiftDownNodes = works.filter(
        (n, ni) => n.deps.includes(node.pkg.name) && ni < shiftDownFromIndex,
      );

      if (shiftDownNodes.length) {
        ok = false;
        shiftDownNodes.forEach((shiftDownNode) => {
          const nodeIndex = works.indexOf(node);
          const hitIndex = works.indexOf(shiftDownNode);
          works.splice(hitIndex, 1);

          const insertTo = nodeIndex + 1;
          works.splice(insertTo, 0, shiftDownNode);
        });
        continue;
      }
    }
  }

  works.sort((a, b) => {
    const al = a.deps.length;
    const bl = b.deps.length;
    if (al === 0) return -1;
    if (bl === 0) return 1;
    return 0;
  });

  return works;
}

function createBuildQueues(nodes: BuildQueueNode[]): BuildQueue[] {
  const results: BuildQueue[] = [];
  const sortedNodes = getSortedBuildQueueNodes(nodes);

  let chunk: BuildQueueNode[] = [];

  while (sortedNodes.length > 0) {
    const nodes = sortedNodes.slice();

    for (const node of nodes) {
      if (chunk.some((n) => node.deps.includes(n.pkg.name))) {
        results.push(chunk);
        chunk = [node];
        const index = sortedNodes.findIndex((n) => n === node);
        sortedNodes.splice(index, 1);
        break;
      }
      chunk.push(node);
      const index = sortedNodes.findIndex((n) => n === node);
      sortedNodes.splice(index, 1);
    }
  }

  if (results[results.length - 1] !== chunk) {
    results.push(chunk);
  }
  return results;
}

export function getBuildQueues(source: string[]): BuildQueue[] {
  const nodes: BuildQueueNode[] = [];

  for (const name of source) {
    const pkgDir = PACKAGES_DIR.join(name);
    const pkg = getPackage(`${pkgDir}/package.json`);
    const deps = getDeps(name);
    const depNames = deps.map((dep) => dep.replace(/^@fastkit\//, ''));
    const node: BuildQueueNode = { name, pkg, deps, depNames };
    nodes.push(node);
  }

  const queues = createBuildQueues(nodes);
  return queues;
}
