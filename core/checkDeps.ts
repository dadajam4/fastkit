import fs from 'fs-extra';
import path from 'path';
import minimist from 'minimist';
import glob from 'glob';
import { preProcessFile } from 'typescript';
import { builtinModules } from 'module';
import {
  ROOT_DIR,
  PACKAGES_DIR,
  targets as allTargets,
  pathExists,
  getPackage,
} from './utils';
import { FastkitPackage } from './schemes';
import chalk from 'chalk';

const EXCLUDE_PACKAGES = ['fastkit', 'vue-kit'];
const SOURCE_DIRS = ['src'];
const SOURCE_EXTENSIONS = ['js', 'ts', 'jsx', 'tsx'];
const args = minimist(process.argv.slice(2));
const specifiedTarget = args._[0];

type DepMatcher = (dep: string, pkg: FastkitPackage) => boolean;

type RawDepMatcher = string | RegExp | DepMatcher;

function resolveMatcher(raw: RawDepMatcher): DepMatcher {
  if (typeof raw === 'string') {
    return (dep) => dep === raw;
  }
  if (raw instanceof RegExp) {
    return (dep) => raw.test(dep);
  }
  return raw;
}

type NormalizeSetting = [RawDepMatcher, string];

const normalizeSettings: NormalizeSetting[] = [
  [/^@vue\//, 'vue'],
  [/^@nuxt\//, 'nuxt3'],
  [/^@vitejs\//, 'vite'],
  [/^vite-ssr\//, 'vite-ssr'],
  [/^webfont\//, 'webfont'],
  ['virtual:generated-pages', 'vite-plugin-pages'],
  [
    (dep, pkg) => {
      return pkg.name === '@fastkit/byeie';
    },
    '',
  ],
  [
    (dep, pkg) => {
      return pkg.name === '@fastkit/catcher' && dep === 'axios';
    },
    '',
  ],
  [
    (dep, pkg) => {
      return pkg.name === '@fastkit/hashed-sync' && dep === 'imagemin';
    },
    '',
  ],
  [
    (dep, pkg) => {
      return (
        pkg.name === '@fastkit/icon-font-gen' && dep === 'svgicons2svgfont'
      );
    },
    '',
  ],
  [
    (dep, pkg) => {
      return (
        pkg.name === '@fastkit/universal-logger' &&
        dep === '@datadog/browser-logs'
      );
    },
    '',
  ],
];

const excludeSettings: RawDepMatcher[] = [
  (dep, pkg) => {
    return pkg.name === '@fastkit/hashed-sync' && dep === 'imagemin';
  },
  (dep, pkg) => {
    return pkg.name === '@fastkit/sprite-images' && dep === 'spritesmith';
  },
];

function isBuiltinModules(dep: string) {
  return builtinModules.includes(dep);
}

function normalizeDep(dep: string, pkg: FastkitPackage) {
  for (const [rawMatcher, normalized] of normalizeSettings) {
    const matcher = resolveMatcher(rawMatcher);
    if (matcher(dep, pkg)) {
      return normalized;
    }
  }
  return dep;
}

function isExcludeDep(dep: string, pkg: FastkitPackage) {
  for (const rawMatcher of excludeSettings) {
    const matcher = resolveMatcher(rawMatcher);
    if (matcher(dep, pkg)) {
      return true;
    }
  }
  return false;
}

async function extractDeps(sourcePath: string) {
  const source = await fs.readFile(sourcePath, 'utf-8');
  const { importedFiles } = preProcessFile(source);

  return importedFiles
    .filter(({ fileName }) => !fileName.startsWith('.'))
    .map(({ fileName }) => fileName);
}

function findAllDependencies(
  dependencies: FastkitPackage['dependencies'],
  bucket: { [key: string]: string } = {},
) {
  if (!dependencies) return bucket;
  const children = Object.keys(dependencies).filter(
    (dep) => bucket[dep] == null,
  );
  children.forEach((dep) => {
    let packagePath: string;
    if (dep === 'fastkit') {
      packagePath = PACKAGES_DIR.join('fastkit');
    } else if (dep.startsWith('@fastkit')) {
      packagePath = PACKAGES_DIR.join(dep.replace('@fastkit/', ''));
    } else {
      packagePath = ROOT_DIR.join('node_modules', dep);
    }
    const pkg = getPackage(packagePath);
    Object.assign(bucket, pkg.dependencies);
    findAllDependencies(pkg.dependencies, bucket);
  });
  return bucket;
}

async function checkPackage(packagePath: string) {
  const rootPkg = await getPackage(ROOT_DIR.toString());
  const pkg = await getPackage(packagePath);

  const allDeps = findAllDependencies(pkg.dependencies);

  const sourceDirs: string[] = [];
  for (const dirName of SOURCE_DIRS) {
    const sourceDir = path.join(packagePath, dirName);
    if (await pathExists(sourceDir, 'dir')) {
      sourceDirs.push(sourceDir);
    }
  }
  const sources: string[] = [];
  for (const dir of sourceDirs) {
    const _sources = glob.sync(
      path.join(dir, `**/*.+(${SOURCE_EXTENSIONS.join('|')})`),
    );
    sources.push(..._sources.filter((s) => !s.includes('/__tests__/')));
  }

  const deps: string[] = [];

  for (const sourcePath of sources) {
    const _deps = await extractDeps(sourcePath);
    _deps.forEach((dep) => {
      if (isBuiltinModules(dep)) {
        return;
      }
      const normalizedDep = normalizeDep(dep, pkg);
      if (isExcludeDep(normalizedDep, pkg)) {
        return;
      }
      if (normalizedDep && !deps.includes(normalizedDep)) {
        deps.push(normalizedDep);
      }
    });
  }

  const allPkgDeps = {
    ...pkg.dependencies,
    ...pkg.peerDependencies,
  };

  const rootPkgAllDeps = {
    ...rootPkg.dependencies,
    ...rootPkg.devDependencies,
    ...rootPkg.peerDependencies,
  };

  const missingDeps: string[] = [];
  const unnecessaryDeps: string[] = [];
  const missingPkgVersions: string[] = [];

  deps.forEach((dep) => {
    if (!allPkgDeps[dep] && !allDeps[dep]) {
      missingDeps.push(dep);
    }
  });

  Object.keys(allPkgDeps).forEach((dep) => {
    if (isExcludeDep(dep, pkg)) {
      return;
    }
    if (!deps.includes(dep)) {
      unnecessaryDeps.push(dep);
    }
    if (!dep.startsWith('@fastkit') && !rootPkgAllDeps[dep] && !allDeps[dep]) {
      missingPkgVersions.push(dep);
    }
  });

  const hasInconsistencies =
    missingDeps.length > 0 ||
    unnecessaryDeps.length > 0 ||
    missingPkgVersions.length > 0;

  return {
    pkg,
    hasInconsistencies,
    missingDeps,
    unnecessaryDeps,
    missingPkgVersions,
  };
}

async function run() {
  let targets: string[];
  if (specifiedTarget) {
    if (!allTargets.includes(specifiedTarget)) {
      throw new Error(`missing specified target "${specifiedTarget}"`);
    }
    targets = [specifiedTarget];
  } else {
    targets = allTargets.filter((t) => !EXCLUDE_PACKAGES.includes(t));
  }

  const inconsistencies: FastkitPackage[] = [];

  for (const target of targets) {
    const packagePath = PACKAGES_DIR.join(target);
    const {
      pkg,
      hasInconsistencies,
      missingDeps,
      unnecessaryDeps,
      missingPkgVersions,
    } = await checkPackage(packagePath);

    if (hasInconsistencies) {
      inconsistencies.push(pkg);
      console.log(chalk.cyan(`>>> ${pkg.name} <<<`));
      console.log(`  ${path.join(packagePath, 'package.json')}`);
      if (missingDeps.length) {
        console.log(chalk.red(`    Missing deps...`));
        missingDeps.forEach((dep) => {
          console.log(chalk.red(`    - ${dep}`));
        });
      }
      if (unnecessaryDeps.length) {
        console.log(chalk.yellow(`    Unnecessary deps...`));
        unnecessaryDeps.forEach((dep) => {
          console.log(chalk.yellow(`    - ${dep}`));
        });
      }
      if (missingPkgVersions.length) {
        console.log(
          chalk.yellow(
            `    Missing version(Root package.json or nested) deps...`,
          ),
        );
        missingPkgVersions.forEach((dep) => {
          console.log(chalk.yellow(`    - ${dep}`));
        });
      }
      console.log();
    }
  }

  if (inconsistencies.length) {
    console.log(
      chalk.red(
        `Inconsistencies found in ${inconsistencies.length} package(s).`,
      ),
    );
  } else {
    console.log(chalk.green('All green !!!!!'));
  }
}

run();
