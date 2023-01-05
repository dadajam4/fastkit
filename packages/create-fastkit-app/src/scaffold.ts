import fs from 'fs-extra';
import path from 'path';
import { FastkitAppConfig, FastkitAppPackageConfig } from './schemes';
import { getFlatFiles, processTemplate } from './utils';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

const _dirname = path.dirname(fileURLToPath(new URL('.', import.meta.url)));

export async function scaffold(config: FastkitAppConfig) {
  const PACKAGES_DIR = path.join(config.dest, 'packages');
  const TEMPLATES_DIR = path.resolve(_dirname, '../templates');
  const SHARED_TEMPLATES_DIR = path.join(TEMPLATES_DIR, 'shared');

  await fs.emptyDir(config.dest);
  await fs.emptyDir(PACKAGES_DIR);

  const { dependencies } = config;
  const keys = Object.keys(dependencies).sort((a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
  const _dependencies: { [pkg: string]: string } = {};
  keys.forEach((key) => {
    const value = dependencies[key];
    _dependencies[key] = value;
  });
  const eslintExtensions = ['ts', 'tsx', 'js', 'html', 'yaml'];
  const stylelintExtensions = ['css', 'scss', 'html'];
  if (config.vue) {
    eslintExtensions.push('vue');
    stylelintExtensions.push('vue');
  }
  const _eslintExtensions = eslintExtensions.join(',');
  const _stylelintExtensions = stylelintExtensions.join(',');
  const apps: FastkitAppPackageConfig[] = [];
  const { backend, frontend } = config.packages;
  backend && apps.push(backend);
  frontend && apps.push(frontend);
  const devs = apps.map(({ dirName }) => `dev:${dirName}`);
  const builds = apps.map(({ dirName }) => `build:${dirName}`);

  const pkgJson = {
    name: config.name,
    version: '1.0.0',
    license: config.license,
    scripts: {
      dev: `run-p ${devs.join(' ')}`,
      build: `run-p ${builds.join(' ')}`,
      eslint: `eslint . --ext ${_eslintExtensions}`,
      'eslint:fix': `eslint . --ext ${_eslintExtensions} --fix`,
      stylelint: `stylelint "**/*.{${_stylelintExtensions}}" --ignore-path .gitignore`,
      'stylelint:fix': `stylelint "**/*.{${_stylelintExtensions}}" --ignore-path .gitignore --fix`,
      lint: 'run-s eslint stylelint',
      format: 'run-s eslint:fix stylelint:fix',
      typecheck: 'tsc --noEmit --skipLibCheck',
      test: 'jest --runInBand',
    } as { [key: string]: string },
    gitHooks: {
      'pre-commit': 'lint-staged',
    },
    'lint-staged': {
      [`*.{${_eslintExtensions}}`]: ['eslint --fix'],
      [`*.{${stylelintExtensions}}`]: ['stylelint --fix'],
    },
    browserslist: ['last 2 versions'],
    dependencies: _dependencies,
  };

  apps.forEach(({ dirName }) => {
    pkgJson.scripts[`dev:${dirName}`] = `cd packages/${dirName} && npm run dev`;
  });
  apps.forEach(({ dirName }) => {
    pkgJson.scripts[
      `build:${dirName}`
    ] = `cd packages/${dirName} && npm run build`;
  });

  await fs.writeJSON(path.join(config.dest, 'package.json'), pkgJson, {
    spaces: 2,
  });

  const sharedFiles = await getFlatFiles(SHARED_TEMPLATES_DIR);
  await Promise.all(sharedFiles.map((info) => processTemplate(info, config)));

  for (const pkg of config.packageList) {
    const pkgFiles = await getFlatFiles(pkg.src);
    await Promise.all(
      pkgFiles.map((info) => processTemplate(info, config, pkg)),
    );
  }

  console.log(chalk.green.bold('You have successfully created a workspace.'));
  console.log(chalk.cyan(`  cd ${config.name}`));
  console.log(chalk.cyan(`  npm install # or yarn or pnpm install`));
}
