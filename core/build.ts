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
  const ret: Promise<any>[] = [];
  const executing: Promise<any>[] = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source));
    ret.push(p);

    if (maxConcurrency <= source.length) {
      const e: Promise<any> = p.then(() =>
        executing.splice(executing.indexOf(e), 1),
      );
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
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

  function processColorTypes(dts: string) {
    const targets = ['ThemeName', 'PaletteName', 'ScopeName', 'ColorVariant'];

    const hits: string[] = [];
    targets.forEach((target) => {
      const re = new RegExp(`"__${target}__"`, 'g');
      const matched = dts.match(re);
      if (matched) {
        hits.push(target);
        dts = dts.replace(re, target);
      }
    });

    const re = /import \{([^\{\}]+)\} from '@fastkit\/color-scheme'/;
    const importMatched = dts.match(re);
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
        if (!mods.includes(target)) {
          appends.push(target);
        }
      });
      if (appends.length) {
        dts = dts.replace(
          re,
          `import { $1, ${appends.join(', ')} } from '@fastkit/color-scheme'`,
        );
      }
    } else {
      dts = `import { ${targets.join(
        ', ',
      )} } from '@fastkit/color-scheme';\n${dts}`;
    }

    if (hits.length) {
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
      const colorProcessed = processColorTypes(dts);
      if (colorProcessed) {
        await fs.writeFile(dtsPath, colorProcessed);
      }
    }
    console.log(dtsPath);
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
