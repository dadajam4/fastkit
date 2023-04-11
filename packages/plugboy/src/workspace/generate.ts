import path from 'node:path';
import fs from 'node:fs/promises';
import { getProject } from '../project';
import { getWorkspace, syncWorkspacePackageFields } from '../workspace';
import { WorkspacePackageJson, ProjectScriptsTemplate } from '../types';
import sortPackageJson from 'sort-package-json';
import { WORKSPACE_CONFIG_BASENAME } from '../constants';

import inquirer from 'inquirer';

export async function generateWorkspace(
  workspaceName?: string,
  cwd = process.cwd(),
) {
  const project = await getProject(cwd);
  const { config } = project;

  // ====================
  // workspace name
  // ====================
  while (!workspaceName) {
    const { value } = await inquirer.prompt({
      type: 'input',
      name: 'value',
      message: 'Enter a workspace name',
    });

    if (value) {
      workspaceName = value;
    }
  }

  // ====================
  // description
  // ====================
  const { description } = await inquirer.prompt({
    type: 'input',
    name: 'description',
    default: workspaceName,
    message: 'Please enter a description of your package',
  });

  // ====================
  // version
  // ====================
  let version: string | undefined;
  while (!version) {
    const { value } = await inquirer.prompt({
      type: 'input',
      name: 'value',
      default: '0.0.0',
      message: 'Please enter the initial version',
    });

    if (value) {
      version = value;
    }
  }

  // ====================
  // keywords
  // ====================
  const { rawKeywords } = await inquirer.prompt({
    type: 'input',
    name: 'rawKeywords',
    message: 'Enter as many keywords, if any, as needed, separated by commas',
  });

  const keywords = (rawKeywords as string)
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word.length);

  // ====================
  // scripts
  // ====================
  const scriptsTemplates = config.scripts;
  let scriptsTemplate: ProjectScriptsTemplate | undefined;
  if (scriptsTemplates && scriptsTemplates.length) {
    const { value } = await inquirer.prompt({
      type: 'rawlist',
      message: 'Select a scripts template',
      name: 'value',
      choices: [
        { name: 'None', value: '' },
        ...scriptsTemplates.map((tpl) => ({
          name: tpl.name,
          value: tpl.name,
        })),
      ],
    });
    scriptsTemplate = scriptsTemplates.find((tpl) => tpl.name === value);
  }
  const scripts = scriptsTemplate?.scripts || {};

  // ====================
  // peerDependencies
  // ====================
  const peerDependencies = await (async () => {
    const { deps } = await inquirer.prompt<{ deps: string[] }>({
      type: 'checkbox',
      message:
        'Select the dependent packages, if any, to be used in the package',
      name: 'deps',
      choices: Object.keys(config.peerDependencies).map((dep) => {
        return {
          name: dep,
          value: dep,
        };
      }),
    });
    if (!deps.length) return;
    return Object.fromEntries(
      deps.map((dep) => [dep, config.peerDependencies[dep]]),
    );
  })();

  // ====================
  // dependencies
  // ====================
  const dependencies = await (async () => {
    const { deps } = await inquirer.prompt<{ deps: string[] }>({
      type: 'checkbox',
      message: 'Select the internal package to be used, if any.',
      name: 'deps',
      choices: project.resolvedWorkspaces.map((workspace) => {
        const name = path.basename(workspace);
        return {
          name,
          value: name,
        };
      }),
    });
    if (!deps.length) return;
    return Object.fromEntries(
      deps.map((dep) => [`@${project.name}/${dep}`, 'workspace:*']),
    );
  })();

  // ====================
  // Generate source files?
  // ====================
  const { withGenSource } = await inquirer.prompt<{ withGenSource: boolean }>({
    type: 'confirm',
    name: 'withGenSource',
    message: 'Generate source files?',
    default: true,
  });

  // ====================
  // final confirmation
  // ====================
  const _json: WorkspacePackageJson = {
    name: `@${project.name}/${workspaceName}`,
    type: 'module',
    description,
    version,
    keywords,
    scripts,
    peerDependencies,
    dependencies,
  };

  syncWorkspacePackageFields(project.json, _json);

  const json = sortPackageJson(_json);

  const workspaceDir = path.join(config.workspacesDir, workspaceName);

  console.log('');
  console.log('========================================');
  console.log(`Directory: ${workspaceDir}`);
  console.log(`Generate source: ${withGenSource ? 'Yes' : 'No'}`);
  console.log(json);
  console.log('========================================');

  const { confirmation } = await inquirer.prompt<{ confirmation: boolean }>({
    type: 'confirm',
    name: 'confirmation',
    message: 'Is this OK?',
    default: true,
  });

  if (!confirmation) {
    console.log('Skiped.');
    process.exit(1);
  }

  // 1. Create directory
  await fs.mkdir(workspaceDir);

  // 2. Write package.json
  await fs.writeFile(
    path.join(workspaceDir, 'package.json'),
    JSON.stringify(json, null, 2),
  );

  // 3. Write README.md
  await fs.writeFile(path.join(workspaceDir, 'README.md'), config.readme(json));

  // 3. Generate source
  if (withGenSource) {
    const srcDir = path.join(workspaceDir, 'src');
    await fs.mkdir(srcDir);

    const indexCode = `export * from './${workspaceName}';\n`;
    const modCode = `export const PACKAGE_NAME = './${workspaceName}';\n`;

    await fs.writeFile(path.join(srcDir, 'index.ts'), indexCode);
    await fs.writeFile(path.join(srcDir, `${workspaceName}.ts`), modCode);

    const { tsconfig } = config;
    if (tsconfig) {
      await fs.writeFile(
        path.join(workspaceDir, 'tsconfig.json'),
        JSON.stringify(tsconfig, null, 2),
      );
    }

    const configFileCode =
      `
import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
  },
});
    `.trim() + '\n';
    await fs.writeFile(
      path.join(workspaceDir, `${WORKSPACE_CONFIG_BASENAME}.ts`),
      configFileCode,
    );

    const workspace = await getWorkspace(workspaceDir);
    await workspace.preparePackageJSON();
  }
}
