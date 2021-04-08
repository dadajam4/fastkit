// create package.json, README, etc. for packages that don't have them yet
import minimist from 'minimist';
import fs from 'fs-extra';
import path from 'path';
import { getPackage } from './utils';
import { FastkitPackage } from './schemes';

export interface BootstrapArgs {
  target?: string;
  force?: boolean;
}

const args = minimist<BootstrapArgs>(process.argv.slice(2));
const rootPkg = getPackage();
const version = rootPkg.version;

const packagesDir = path.resolve(__dirname, '../packages');
const { target, force } = args;

if (target) {
  fs.ensureDirSync(path.join(packagesDir, target));
}

const files = fs.readdirSync(packagesDir);

files.forEach((shortName) => {
  if (target && target !== shortName) {
    return;
  }

  if (!fs.statSync(path.join(packagesDir, shortName)).isDirectory()) {
    return;
  }

  const name = shortName === `fastkit` ? shortName : `@fastkit/${shortName}`;
  const pkgPath = path.join(packagesDir, shortName, `package.json`);
  const pkgExists = fs.existsSync(pkgPath);
  if (pkgExists) {
    const pkg = getPackage(pkgPath);
    if (pkg.private) {
      return;
    }
  }

  if (force || !pkgExists) {
    const json: FastkitPackage = {
      name,
      version,
      description: name,
      main: 'index.js',
      module: `dist/${shortName}.esm-bundler.js`,
      files: [`index.js`, `dist`],
      types: `dist/${shortName}.d.ts`,
      repository: rootPkg.repository,
      keywords: rootPkg.keywords,
      author: rootPkg.author,
      license: rootPkg.license,
      bugs: {
        url: `${rootPkg.homepage}/issues`,
      },
      homepage: `${rootPkg.homepage}/tree/dev/packages/${shortName}#readme`,
    };
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
  }

  const readmePath = path.join(packagesDir, shortName, `README.md`);
  if (force || !fs.existsSync(readmePath)) {
    fs.writeFileSync(readmePath, `# ${name}`);
  }

  const apiExtractorConfigPath = path.join(
    packagesDir,
    shortName,
    `api-extractor.json`,
  );
  if (force || !fs.existsSync(apiExtractorConfigPath)) {
    fs.writeFileSync(
      apiExtractorConfigPath,
      `
{
  "extends": "../../api-extractor.json",
  "mainEntryPointFilePath": "./dist/packages/<unscopedPackageName>/src/index.d.ts",
  "dtsRollup": {
    "publicTrimmedFilePath": "./dist/<unscopedPackageName>.d.ts"
  }
}
`.trim(),
    );
  }

  const srcDir = path.join(packagesDir, shortName, `src`);
  const indexPath = path.join(packagesDir, shortName, `src/index.ts`);
  if (force || !fs.existsSync(indexPath)) {
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir);
    }
    fs.writeFileSync(indexPath, ``);
  }

  const nodeIndexPath = path.join(packagesDir, shortName, 'index.js');
  if (force || !fs.existsSync(nodeIndexPath)) {
    fs.writeFileSync(
      nodeIndexPath,
      `
'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/${shortName}.cjs.prod.js');
} else {
  module.exports = require('./dist/${shortName}.cjs.js');
}
    `.trim() + '\n',
    );
  }
});
