import fs from 'fs-extra';
import path from 'node:path';
import chalk from 'chalk';
import { prompt as _prompt } from 'enquirer';
import { FastkitAppConfig, BASE_STYLES } from './schemes';
import {
  getAllPackageConfigs,
  getBaseDependencies,
  toVersionMapedDependencies,
} from './utils';

export interface PromptOptions {
  dest?: string;
}

export async function prompt(opts: PromptOptions = {}) {
  const orangeColor = chalk.rgb(255, 165, 0);
  const cwd = process.cwd();
  let { dest: workspaceDir = '' } = opts;
  let workspaceName = '';
  const { version: currentNodeVersion } = process;

  if (workspaceDir) {
    workspaceDir = path.isAbsolute(workspaceDir)
      ? workspaceDir
      : path.resolve(cwd, workspaceDir);
    workspaceName = path.parse(workspaceDir).name;
  } else {
    workspaceName = path.parse(cwd).name;
  }

  const appConfig: FastkitAppConfig = {
    name: workspaceName,
    dest: workspaceDir,
    nodeVersion: currentNodeVersion,
    packageList: [],
    packages: {},
    dependencies: {},
    vue: false,
    eslint: {
      name: 'eslint-config',
    },
    license: 'UNLICENSED',
  };

  const allDependencies: string[] = [];

  const packageConfigs = await getAllPackageConfigs();
  const frontends = packageConfigs.filter((c) => c.type === 'frontend');
  const backends = packageConfigs.filter((c) => c.type === 'backend');
  const others = packageConfigs.filter((c) => c.type === 'other');

  function onCancel(): any {
    console.log(orangeColor('canceled...'));
    process.exit();
  }

  while (!appConfig.dest || !appConfig.name) {
    await _prompt<any>({
      type: 'input',
      name: 'name',
      message: 'Enter a name for the entire workspace.',
      initial: workspaceName,
      onCancel,
    }).then((res) => {
      const name = res.name.trim();
      appConfig.name = name;
      if (!name) {
        return;
      }
      if (!appConfig.dest) {
        appConfig.dest = workspaceName === name ? cwd : path.resolve(cwd, name);
      }
    });
  }

  await _prompt<any>({
    type: 'input',
    name: 'license',
    message: 'Please enter the type of license.',
    initial: appConfig.license,
    onCancel,
  }).then((res) => {
    const license = res.license.trim();
    appConfig.license = license || appConfig.license;
  });

  await _prompt<any>({
    type: 'input',
    name: 'nodeVersion',
    message: 'Specify the Node version to use for the entire workspace.',
    initial: currentNodeVersion.replace(/^v/, ''),
    onCancel,
  }).then((res) => {
    let { nodeVersion } = res;
    if (!nodeVersion) {
      nodeVersion = currentNodeVersion;
    }
    appConfig.nodeVersion = nodeVersion.replace(/^v/, '');
  });

  const frontendChoices = [
    { name: 'None', value: 'none' },
    ...frontends.map((r) => ({
      value: r.name,
      name: r.name,
      hint: r.description,
    })),
  ];
  await _prompt<any>({
    type: 'select',
    name: 'name',
    message: 'Select the frontend package type.',
    // initial: 1,
    choices: frontendChoices,
    onCancel,
  }).then(async (res) => {
    const hit = frontends.find((r) => r.name === res.name);
    if (hit) {
      appConfig.packageList.push(hit);
      appConfig.packages[hit.name] = hit;
      appConfig.packages.frontend = hit;

      const baseStyleChoices = [
        {
          name: 'None',
          value: 'none',
        },
        ...BASE_STYLES,
      ];

      const { baseStyle } = await _prompt<any>({
        type: 'select',
        name: 'baseStyle',
        message: 'Choose a base style.',
        // initial: 1,
        choices: baseStyleChoices,
        onCancel,
      });
      const baseStyleHit =
        baseStyle !== 'none' &&
        baseStyleChoices.find((c) => c.value === baseStyle);
      if (baseStyleHit) {
        hit.baseStyle = baseStyleHit.value;
      }

      await _prompt<any>({
        type: 'input',
        name: 'port',
        message: 'Specify the frontend server port number.',
        initial: 3000,
        onCancel,
      }).then((res) => {
        let { port } = res;
        port = port.trim();
        port = isNaN(port) ? 3000 : parseInt(port, 10);
        hit.port = port;
      });
    }
  });

  const backendChoices = [
    { name: 'None', value: 'none' },
    ...backends.map((r) => ({
      value: r.name,
      name: r.name,
      hint: r.description,
    })),
  ];
  await _prompt<any>({
    type: 'select',
    name: 'name',
    message: 'Select the backend package type.',
    // initial: 1,
    choices: backendChoices,
    onCancel,
  }).then(async (res) => {
    const hit = backends.find((r) => r.name === res.name);
    if (hit) {
      appConfig.packageList.push(hit);
      appConfig.packages[hit.name] = hit;
      appConfig.packages.backend = hit;

      await _prompt<any>({
        type: 'input',
        name: 'port',
        message: 'Specify the backend server port number.',
        initial: 4000,
        onCancel,
      }).then((res) => {
        let { port } = res;
        port = port.trim();
        port = isNaN(port) ? 4000 : parseInt(port, 10);
        hit.port = port;
      });
    }
  });

  const { frontend, backend } = appConfig.packages;
  if (frontend && backend) {
    await _prompt<any>({
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to use Proxy for frontend to backend?',
      initial: true,
      onCancel,
    }).then((res) => {
      frontend.proxy = res.confirm;
    });
  }

  const otherChoices = [
    ...others.map((r) => ({
      value: r.name,
      name: r.name,
    })),
  ];
  await _prompt<any>({
    type: 'select',
    name: 'names',
    message: 'Select as many other package types as you need.',
    multiple: true,
    choices: otherChoices,
    onCancel,
  } as any).then((res) => {
    res.names.forEach((name: string) => {
      const hit = others.find((r) => r.name === name);
      if (hit) {
        appConfig.packageList.push(hit);
        appConfig.packages[hit.name] = hit;
      }
    });
  });

  for (const pkg of appConfig.packageList) {
    pkg.dirName = pkg.type === 'other' ? pkg.name : pkg.type;
    await _prompt<any>({
      type: 'input',
      name: 'dirName',
      message: `Please input a ${pkg.dirName} directory name.`,
      initial: pkg.dirName,
      onCancel,
    }).then((res) => {
      const dirName = res.dirName.trim() || pkg.dirName;
      pkg.dirName = dirName;
    });
    pkg.dest = path.join(appConfig.dest, `packages/${pkg.dirName}`);
    const { dependencies: pkgDependencies = [] } = pkg;
    allDependencies.push(...pkgDependencies);
  }

  appConfig.vue = appConfig.packageList.some((pkg) => pkg.vue);
  if (appConfig.vue) {
    appConfig.eslint.name = 'eslint-config-vue';
    allDependencies.push('@fastkit/eslint-config-vue');
  } else {
    allDependencies.push('@fastkit/eslint-config');
  }
  allDependencies.push(...getBaseDependencies(appConfig));
  appConfig.dependencies = toVersionMapedDependencies(
    Array.from(new Set(allDependencies)),
  );

  const packageDump = appConfig.packageList
    .map((pkg) => {
      const name =
        pkg.type === 'other' ? pkg.name : `[${pkg.type}] ${pkg.name}`;
      return `  - ${name}: ${chalk.bold(pkg.dest)}`;
    })
    .join('\n');

  console.log(
    orangeColor(
      `
==================================================
Workspace name: ${chalk.bold(appConfig.name)}
Output: ${chalk.bold(appConfig.dest)}

Packages:
${packageDump}
==================================================
  `,
    ).trim(),
  );

  await _prompt<any>({
    type: 'confirm',
    name: 'confirm',
    message: 'Would you like to create a workspace with this setting?',
    initial: true,
    onCancel,
  }).then((res) => {
    if (!res.confirm) {
      onCancel();
    }
  });

  if (await fs.pathExists(appConfig.dest)) {
    await _prompt<any>({
      type: 'confirm',
      name: 'confirm',
      message: 'The directory already exists, do you want to overwrite it?',
      initial: false,
      onCancel,
    }).then((res) => {
      if (!res.confirm) {
        onCancel();
      }
    });
  }

  return appConfig;
}
