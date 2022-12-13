/*
Produces production builds and stitches together d.ts files.
To specify the package to build, simply pass its name and the desired build
formats to output (defaults to `buildOptions.formats` specified in that package,
or "esm,cjs"):
```
# name supports fuzzy match. will build all packages with name containing "dom":
npm run build helpers
 or
yarn build helpers
# specify the format to output
npm run build helpers -- --formats cjs
 or
yarn build helpers --formats cjs
```
*/

import { cpus } from 'os';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import execa from 'execa';
import { compress } from 'brotli';
import { gzipSync } from 'zlib';
import minimist from 'minimist';
import {
  ROOT_DIR,
  PACKAGES_DIR,
  targets as allTargets,
  fuzzyMatchTarget,
  getCommit,
  pathExists,
  getPackage,
  getBuildQueues,
} from './utils';

export interface BuildArgs {
  targets: string[];
  formats?: string;
  f?: string;
  devOnly?: boolean;
  d?: boolean;
  prodOnly?: boolean;
  p?: boolean;
  sourcemap?: boolean;
  s?: boolean;
  release?: boolean;
  types?: boolean;
  t?: boolean;
  all?: boolean;
  a?: boolean;
}

const args = minimist<BuildArgs>(process.argv.slice(2));
const targets = args._;
const formats = args.formats || args.f;
const devOnly = args.devOnly || args.d;
const prodOnly = !devOnly && (args.prodOnly || args.p);
const sourceMap = args.sourcemap || args.s;
const isRelease = args.release;
const buildTypes = args.t || args.types || isRelease;
const buildAllMatching = args.all || args.a;
const commit = getCommit();

run();

async function run() {
  if (isRelease || true) {
    // remove build cache for release builds to avoid outdated enum values
    await fs.remove(ROOT_DIR.join('node_modules/.rts2_cache'));
  }
  if (!targets.length) {
    await buildAll(allTargets);
    checkAllSizes(allTargets);
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching));
    checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching));
  }
}

async function buildAll(targets: string[]) {
  await runParallel(cpus().length, targets, build);
}

async function runParallel(
  maxConcurrency: number,
  source: string[],
  iteratorFn: (target: string, source: string[]) => Promise<any>,
) {
  const queues = getBuildQueues(source);
  const total = queues.flat().length;
  let suceeded = 0;

  for (const queue of queues) {
    const ret: Promise<any>[] = [];
    const executing: Promise<any>[] = [];
    for (const node of queue) {
      const p = Promise.resolve().then(() =>
        iteratorFn(node.name, source).then(() => {
          suceeded++;
          console.log(
            chalk.bold(
              chalk.green(
                `(${suceeded}/${total}) ${node.name} completed successfully.`,
              ),
            ),
          );
        }),
      );
      ret.push(p);

      if (maxConcurrency <= queue.length) {
        const e: Promise<any> = p.then(() =>
          executing.splice(executing.indexOf(e), 1),
        );
        executing.push(e);
        if (executing.length >= maxConcurrency) {
          await Promise.race(executing);
        }
      }
    }
    await Promise.all(ret);
  }
}

async function build(target: string) {
  const pkgDir = PACKAGES_DIR.join(target);
  const pkg = getPackage(`${pkgDir}/package.json`);
  const destDir = path.join(pkgDir, 'dist');

  // only build published packages for release
  if (isRelease && pkg.private) {
    return;
  }

  // if building a specific format, do not remove dist.
  if (!formats) {
    await fs.remove(destDir);
  }

  const buildOptions = pkg.buildOptions || {};

  const env = buildOptions.env || (devOnly ? 'development' : 'production');
  const { tool } = buildOptions;

  await execa(
    'rollup',
    [
      '-c',
      '--environment',
      [
        `COMMIT:${commit}`,
        `NODE_ENV:${env}`,
        `TARGET:${target}`,
        formats ? `FORMATS:${formats}` : ``,
        buildTypes ? `TYPES:true` : ``,
        prodOnly ? `PROD_ONLY:true` : ``,
        sourceMap ? `SOURCE_MAP:true` : ``,
        tool ? `TOOL:true` : ``,
      ]
        .filter(Boolean)
        .join(','),
    ],
    { stdio: 'inherit' },
  );

  if (buildTypes && pkg.types) {
    console.log();
    console.log(
      chalk.bold(chalk.yellow(`Rolling up type definitions for ${target}...`)),
    );

    // build types
    const dtsDir = path.resolve(pkgDir, 'dist/packages', target, 'src');
    if (await pathExists(dtsDir, 'dir')) {
      const dtsList: string[] = [];
      async function tickDir(dir: string) {
        const files = await fs.readdir(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          if (fullPath.endsWith('.d.ts')) {
            dtsList.push(fullPath);
          } else if ((await fs.stat(fullPath)).isDirectory()) {
            await tickDir(fullPath);
          }
        }
      }
      await tickDir(dtsDir);

      for (const dts of dtsList) {
        let dtsSrc = await fs.readFile(dts, 'utf-8');
        const dynamicImports =
          dtsSrc.match(/([\r\n\s])?import\("(.*?)"\)\.([0-9a-zA-Z$_\-]+)/g) ||
          [];
        const namedMap: { [id: string]: string[] } = {};
        dynamicImports.forEach((row) => {
          const match = row.match(
            /([\r\n\s])?import\("(.*?)"\)\.([0-9a-zA-Z$_\-]+)/,
          );
          if (match) {
            const id = match[2];
            const name = match[3];
            let bucket = namedMap[id];
            if (!bucket) {
              bucket = [];
              namedMap[id] = bucket;
            }
            if (!bucket.includes(name)) {
              bucket.push(name);
            }
            dtsSrc = dtsSrc.replace(match[0], (match[1] || '') + name);
          }
        });
        if (Object.keys(namedMap).length) {
          for (const id in namedMap) {
            const names = namedMap[id];
            const bracketImportMatch = dtsSrc.match(
              new RegExp(`import(\s[0-9a-zA-Z$_\-]+,)? { (.*?) } from '${id}'`),
            );
            if (bracketImportMatch) {
              const defaultImported = bracketImportMatch[1] || '';
              const alreadyImported = bracketImportMatch[2]
                .replace(/\s/g, '')
                .split(',');
              const needImports = Array.from(
                new Set([...alreadyImported, ...names]),
              );

              dtsSrc = dtsSrc.replace(
                bracketImportMatch[0],
                `import${defaultImported} { ${needImports.join(
                  ', ',
                )} } from '${id}'`,
              );
            } else {
              const importer = `import { ${names.join(', ')} } from '${id}';\n`;
              dtsSrc = `${importer}${dtsSrc}`;
            }
          }
        }
        await fs.writeFile(dts, dtsSrc, 'utf-8');
      }
    }

    const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
    const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
    const extractorConfig =
      ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
    const extractorResult = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true,
    });

    if (tool) {
      const dtsDir = path.join(destDir, `packages/${target}/src/tool`);
      const dtsDest = path.join(destDir, 'tool');
      await fs.copy(dtsDir, dtsDest);
    }

    if (extractorResult.succeeded) {
      await moveDts();
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`,
      );
      process.exitCode = 1;
    }
    await fs.remove(`${pkgDir}/dist/packages`);
    const assetsDir = path.join(pkgDir, 'src/assets');
    if (await pathExists(assetsDir, 'dir')) {
      await fs.copy(assetsDir, path.join(pkgDir, 'dist/assets'));
    }
    if (tool) {
      await fs.remove(`${pkgDir}/dist/tool/packages`);
      const assetsDir = path.join(pkgDir, 'src/tool/assets');
      if (await pathExists(assetsDir, 'dir')) {
        await fs.copy(assetsDir, path.join(pkgDir, 'dist/tool/assets'));
      }
    }
  }

  function processTypesByTargets(dts: string, targets: string[], pkg: string) {
    const importRe = new RegExp(`import {([^\\{\\}]+)} from '${pkg}'`);
    const hits: string[] = [];
    targets.forEach((target) => {
      const re = new RegExp(`"__${target}__"`, 'g');
      const matched = dts.match(re);
      if (matched) {
        hits.push(target);
        dts = dts.replace(re, target);
      }
    });
    if (!hits.length) return;

    const importMatched = dts.match(importRe);
    const imports = importMatched && importMatched[1];
    if (imports) {
      const mods = imports
        .trim()
        .split(',')
        .map((row) => {
          row = row.split(' as ')[0].trim();
          return row;
        });
      const appends: string[] = [];
      targets.forEach((target) => {
        const re = new RegExp(`(^|\n)import { ${target} } from '${pkg}'`);
        if (!re.test(dts) && !mods.includes(target)) {
          appends.push(target);
        }
      });
      if (appends.length) {
        dts = dts.replace(
          importRe,
          `import { $1, ${appends.join(', ')} } from '${pkg}'`,
        );
      }
    } else {
      const mods: string[] = [];
      targets.forEach((target) => {
        if (!dts.includes(`export declare type ${target} = `)) {
          mods.push(target);
        }
      });
      if (mods.length) {
        dts = `import { ${targets.join(', ')} } from '${pkg}';\n${dts}`;
      }
    }

    if (hits.length) {
      return dts;
    }
  }

  async function processTypes(dts: string) {
    let processed = false;

    const srcDir = path.resolve(pkgDir, 'src');
    for (const vec of ['appends', 'prepends'] as const) {
      const _typesPath = path.join(srcDir, `_types-${vec}.txt`);
      if (await pathExists(_typesPath, 'file')) {
        const _types = await fs.readFile(_typesPath, 'utf-8');
        processed = true;
        if (vec === 'appends') {
          dts += _types;
        } else {
          dts = `${_types}${dts}`;
        }
      }
    }

    const settings: { targets: string[]; pkg: string }[] = [
      {
        targets: ['ThemeName', 'PaletteName', 'ScopeName', 'ColorVariant'],
        pkg: '@fastkit/color-scheme',
      },
      {
        targets: ['MediaMatchKey'],
        pkg: '@fastkit/media-match',
      },
      {
        targets: ['IconName'],
        pkg: '@fastkit/icon-font',
      },
    ];
    settings.forEach(({ targets, pkg }) => {
      const result = processTypesByTargets(dts, targets, pkg);
      if (result) {
        processed = true;
        dts = result;
      }
    });
    if (processed) {
      return dts;
    }
  }

  async function moveDts() {
    // concat additional d.ts to rolled-up dts
    const typesDir = path.resolve(pkgDir, 'types');
    const dtsPath = path.resolve(pkgDir, pkg.types);
    if (await pathExists(typesDir, 'dir')) {
      const existing = await fs.readFile(dtsPath, 'utf-8');
      const typeFiles = await fs.readdir(typesDir);
      const toAdd = await Promise.all(
        typeFiles.map((file) => {
          return fs.readFile(path.resolve(typesDir, file), 'utf-8');
        }),
      );
      await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
    }
    if (await pathExists(dtsPath, 'file')) {
      const dts = await fs.readFile(dtsPath, 'utf-8');
      const typeProcessed = await processTypes(dts);
      if (typeProcessed) {
        await fs.writeFile(dtsPath, typeProcessed);
      }
    }
    console.log(
      chalk.bold(chalk.green(`API Extractor completed successfully.`)),
    );
  }
}

function checkAllSizes(targets: string[]) {
  if (devOnly) {
    return;
  }
  console.log();
  for (const target of targets) {
    checkSize(target);
  }
  console.log();
}

function checkSize(target: string) {
  const pkgDir = PACKAGES_DIR.join(target);
  checkFileSize(`${pkgDir}/dist/${target}.global.prod.js`);
}

function checkFileSize(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  const file = fs.readFileSync(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  const gzipped = gzipSync(file);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(file);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(
    `${chalk.gray(
      chalk.bold(path.basename(filePath)),
    )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`,
  );
}
