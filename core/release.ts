import minimist from 'minimist';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import { prompt } from 'enquirer';
import execa from 'execa';
import { ROOT_DIR, PACKAGES_DIR, getPackage } from './utils';
import { FastkitPackage } from './schemes';

type ExecaOptions<EncodingType = string> = execa.Options<EncodingType>;

export interface ReleaseArgs {
  preid?: string;
  dry?: boolean;
  skipTests?: boolean;
  skipBuild?: boolean;
  tag?: string;
}

const args = minimist<ReleaseArgs>(process.argv.slice(2));
const rootPkg = getPackage();
const { version: currentVersion } = rootPkg;

const semverPre = semver.prerelease(currentVersion);
const preId = args.preid || (semverPre && String(semverPre[0])) || '';
const isDryRun = args.dry;
const skipTests = args.skipTests;
const skipBuild = args.skipBuild;
const packages = fs
  .readdirSync(PACKAGES_DIR.path)
  .filter((p) => !p.endsWith('.ts') && !p.startsWith('.'));

const skippedPackages: string[] = [];

const versionIncrements: semver.ReleaseType[] = [
  'patch',
  'minor',
  'major',
  ...(preId
    ? (['prepatch', 'preminor', 'premajor', 'prerelease'] as const)
    : []),
];

const inc = (i: semver.ReleaseType) => semver.inc(currentVersion, i, preId);
const bin = (name: string) => ROOT_DIR.join('node_modules/.bin/' + name);
const run = (
  bin: string,
  args?: readonly string[],
  opts: ExecaOptions<string> = {},
) => execa(bin, args, { stdio: 'inherit', ...opts });
const dryRun = (
  bin: string,
  args?: readonly string[],
  opts: ExecaOptions<string> = {},
) => console.log(chalk.blue(`[dryrun] ${bin} ${(args || []).join(' ')}`), opts);
const runIfNotDry = isDryRun ? dryRun : run;
const getPkgRoot = (pkg: string) => PACKAGES_DIR.join(pkg);
const step = (msg: string) => console.log(chalk.cyan(msg));

type RunIfNotDry = typeof dryRun | typeof run;

async function main() {
  let targetVersion = args._[0];

  if (!targetVersion) {
    // no explicit version, offer suggestions
    const { release } = await prompt<{
      release: string;
    }>({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements
        .map((i) => `${i} (${inc(i)})`)
        .concat(['custom']),
    });

    if (release === 'custom') {
      targetVersion = (
        await prompt<{
          version: string;
        }>({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion,
        })
      ).version;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      targetVersion = release.match(/\((.*)\)/)![1];
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`);
  }

  const { yes } = await prompt<{ yes: boolean }>({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion}. Confirm?`,
  });

  if (!yes) {
    return;
  }

  // run tests before release
  step('\nRunning tests...');
  if (!skipTests && !isDryRun) {
    await run(bin('jest'), ['--clearCache']);
    await run('yarn', ['test', '--bail']);
  } else {
    console.log(`(skipped)`);
  }

  // update all package versions and inter-dependencies
  step('\nUpdating cross dependencies...');
  require('./cfa-dependencies');
  await updateVersions(targetVersion);

  // build all packages with types
  step('\nBuilding all packages...');
  if (!skipBuild && !isDryRun) {
    await run('yarn', ['build', '--release']);
    // // test generated dts files
    // step('\nVerifying type declarations...');
    // await run('yarn', ['test-dts-only']);
  } else {
    console.log(`(skipped)`);
  }

  // generate changelog
  await run(`yarn`, ['changelog']);

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    step('\nCommitting changes...');
    await runIfNotDry('git', ['add', '-A']);
    await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`]);
  } else {
    console.log('No changes to commit.');
  }

  // publish packages
  step('\nPublishing packages...');
  for (const pkg of packages) {
    await publishPackage(pkg, targetVersion, runIfNotDry);
  }

  // push to GitHub
  step('\nPushing to GitHub...');
  await runIfNotDry('git', ['tag', `v${targetVersion}`]);
  await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await runIfNotDry('git', ['push']);

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`);
  }

  if (skippedPackages.length) {
    console.log(
      chalk.yellow(
        `The following packages are skipped and NOT published:\n- ${skippedPackages.join(
          '\n- ',
        )}`,
      ),
    );
  }
  console.log();
}

async function updateVersions(version: string) {
  // 1. update root package.json
  await updatePackage(ROOT_DIR.toString(), version);
  // 2. update all packages
  for (const pkg of packages) {
    await updatePackage(PACKAGES_DIR.join(pkg), version);
  }
}

async function updatePackage(pkgRoot: string, version: string) {
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'));
  pkg.version = version;
  await updateDeps(pkg, 'dependencies', version);
  await updateDeps(pkg, 'peerDependencies', version);
  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('---', pkg.name, pkg.version);
}

const externalModuleVersionDetectedCache: {
  [dep: string]: string | null;
} = {};

const externalPackages: {
  [pkg: string]: FastkitPackage;
} = {};

let externalPackagesLoaded = false;

async function loadExternalPackages() {
  if (externalPackagesLoaded) return;
  const { peerDependencies = {}, dependencies = {} } = rootPkg;
  const pkgs = Array.from(
    new Set([...Object.keys(peerDependencies), ...Object.keys(dependencies)]),
  );
  for (const pkg of pkgs) {
    if (externalPackages[pkg]) continue;
    const _pkg = await getPackage(ROOT_DIR.join('node_modules', pkg));
    externalPackages[pkg] = _pkg;
  }
  externalPackagesLoaded = true;
}

async function detectExternalModuleVersion(
  dep: string,
  depType: 'dependencies' | 'peerDependencies',
): Promise<string | null> {
  const cached = externalModuleVersionDetectedCache[dep];
  if (cached !== undefined) return cached;

  await loadExternalPackages();

  const searchBucket: (
    | 'dependencies'
    | 'devDependencies'
    | 'peerDependencies'
  )[] = ['devDependencies', 'peerDependencies'];

  if (!searchBucket.includes(depType)) {
    searchBucket.unshift(depType);
  }

  let version: string | null = null;

  for (const name of searchBucket) {
    const deps = rootPkg[name];
    version = (deps && deps[dep]) || null;
    if (version) {
      break;
    }
  }

  if (!version) {
    for (const pkgName in externalPackages) {
      const deps = externalPackages[pkgName][depType] || {};
      if (deps[dep]) {
        version = deps[dep];
        break;
      }
    }
  }

  if (!version) {
    const depPkg = await getPackage(ROOT_DIR.join('node_modules', dep));
    const depVersion = depPkg && depPkg.version;
    if (depVersion) {
      const parsed = semver.parse(depVersion);
      if (parsed) {
        version = `^${parsed.major}.${parsed.minor}.0`;
      }
    }
  }

  externalModuleVersionDetectedCache[dep] = version;

  return version;
}

async function updateDeps(
  pkg: FastkitPackage,
  depType: 'dependencies' | 'peerDependencies',
  version: string,
) {
  const deps = pkg[depType];
  if (!deps) return;

  for (const dep of Object.keys(deps)) {
    if (
      dep === 'fastkit' ||
      dep === 'create-fastkit-app' ||
      (dep.startsWith('@fastkit') &&
        packages.includes(dep.replace(/^@fastkit\//, '')))
    ) {
      console.log(
        chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`),
      );
      deps[dep] = version;
    } else {
      const version = await detectExternalModuleVersion(dep, depType);
      if (version) {
        console.log(
          chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`),
        );
        deps[dep] = version;
      }
    }
  }
}

async function publishPackage(
  pkgName: string,
  version: string,
  runIfNotDry: RunIfNotDry,
) {
  if (skippedPackages.includes(pkgName)) {
    return;
  }
  const pkgRoot = getPkgRoot(pkgName);
  const pkgPath = path.resolve(pkgRoot, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  if (pkg.private) {
    return;
  }

  // const releaseTag = 'beta';
  let releaseTag = args.tag || null;
  if (!releaseTag) {
    const tmp = semver.prerelease(version);
    if (tmp && typeof tmp[0] === 'string') {
      releaseTag = tmp[0];
    }
  }
  releaseTag = releaseTag || null;

  step(
    `Publishing ${pkgName}... yarn publish --new-version${version} ${
      releaseTag ? ' --tag ' + releaseTag : ''
    } --access public`,
  );
  try {
    await runIfNotDry(
      'yarn',
      [
        'publish',
        '--new-version',
        version,
        ...(releaseTag ? ['--tag', releaseTag] : []),
        '--access',
        'public',
      ],
      {
        cwd: pkgRoot,
        stdio: 'pipe',
      },
    );
    delete require.cache[path.join(pkgRoot, 'package.json')];
    const pkg = require(path.join(pkgRoot, 'package.json'));
    console.log('>>>', pkgName, pkg.version);
  } catch (e: any) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkgName}`));
    } else {
      throw e;
    }
  }
}

main().catch((err) => {
  console.error(err);
});
