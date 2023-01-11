// create package.json, README, etc. for packages that don't have them yet
import minimist from 'minimist';
import fs from 'fs-extra';
import path from 'node:path';
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
const licenseTemplatePath = path.resolve(__dirname, 'LICENSE.tmpl');
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

  const name =
    shortName === `fastkit` || shortName === `create-fastkit-app`
      ? shortName
      : `@fastkit/${shortName}`;
  const pkgPath = path.join(packagesDir, shortName, `package.json`);
  const pkgExists = fs.existsSync(pkgPath);
  if (pkgExists) {
    const pkg = getPackage(pkgPath);
    if (pkg.private) {
      return;
    }
  }

  if (force || !pkgExists) {
    const mainModule = `dist/${shortName}.mjs`;
    const mainModuleDTS = `dist/${shortName}.d.ts`;
    const json: FastkitPackage = {
      name,
      version,
      description: name,
      main: mainModule,
      exports: {
        '.': mainModule,
        './dist/*': './dist/*',
        './package.json': './package.json',
      },
      module: mainModule,
      files: [`dist`],
      types: mainModuleDTS,
      repository: rootPkg.repository,
      keywords: rootPkg.keywords,
      author: rootPkg.author,
      license: rootPkg.license,
      bugs: {
        url: `${rootPkg.homepage}/issues`,
      },
      homepage: `${rootPkg.homepage}/tree/dev/packages/${shortName}#readme`,
      _docs: {
        scope: '',
        feature: '',
        description: {
          ja: '',
          en: '',
        },
      },
    };
    fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2));
  }

  const licensePath = path.join(packagesDir, shortName, `LICENSE`);
  if (force || !fs.existsSync(licensePath)) {
    const licenseTemplate = fs.readFileSync(licenseTemplatePath, 'utf-8');
    const license = licenseTemplate.replace(
      '[year]',
      String(new Date().getFullYear()).replace(
        '[author]',
        'Ayumu Fujii (dadajam4) and Fastkit contributors',
      ),
    );
    fs.writeFileSync(licensePath, license);
  }

  const readmePath = path.join(packagesDir, shortName, `README.md`);
  if (force || !fs.existsSync(readmePath)) {
    const readmeContent = `
# ${name}

## Documentation
https://dadajam4.github.io/fastkit/${shortName}/
    `.trim();
    fs.writeFileSync(readmePath, readmeContent);
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
