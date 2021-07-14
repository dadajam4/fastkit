const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const chalk = require('chalk');
const ROOT_DIR = path.resolve(__dirname, '..');
const DEPENDENCIES_PATH = path.join(
  ROOT_DIR,
  'packages/create-fastkit-app/templates/dependencies.json',
);
const NODE_MODULES_DIR = path.join(ROOT_DIR, 'node_modules');

const cfaDeps = require(DEPENDENCIES_PATH);

function getPkg(pkgName) {
  try {
    const pkg = require(path.join(NODE_MODULES_DIR, pkgName, 'package.json'));
    return pkg;
  } catch (err) {
    if (err && err.message && err.message.includes('Cannot find module')) {
      return {};
    }
    throw err;
  }
}

let updated = false;

Object.keys(cfaDeps).forEach((dep) => {
  const { version } = getPkg(dep);
  if (!version) {
    console.warn(`!!!!! missing package "${dep}". Skip update.`);
    return;
  }

  const cfaVersion = cfaDeps[dep].replace(/^\^/, '');
  if (semver.gt(version, cfaVersion)) {
    console.log(chalk.yellow(`update "${dep}" ${cfaVersion} -> ${version}`));
    cfaDeps[dep] = `^${version}`;
    updated = true;
  }
});

if (updated) {
  const newDeps = {};
  const keys = Object.keys(cfaDeps).sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  keys.forEach((dep) => {
    newDeps[dep] = cfaDeps[dep];
  });
  fs.writeJSONSync(DEPENDENCIES_PATH, newDeps, { spaces: 2 });
  console.log(chalk.green(`UPDATED ${DEPENDENCIES_PATH}`));
}
