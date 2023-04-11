import { cac } from 'cac';
import { getWorkspace, generateWorkspace } from './workspace';
import pkg from '../package.json';

export async function main() {
  const cli = cac('plugboy');
  cli.version(pkg.version);

  cli
    .command('json', 'Apply workspace settings in package.json.')
    .action(async (files, options) => {
      const workspace = await getWorkspace();
      await workspace.preparePackageJSON();
    });

  cli
    .command('stub', 'Link workspace distributions and source directories.')
    .action(async (files, options) => {
      const workspace = await getWorkspace();
      await workspace.preparePackageJSON();
      await workspace.stub();
    });

  cli
    .command(
      'build',
      'Guess all entries in the workspace and bundle the source code.',
    )
    .action(async (files, options) => {
      const workspace = await getWorkspace();
      await workspace.preparePackageJSON();
      await workspace.build();
    });

  cli
    .command('clean', 'Deletes the distribution directory of the workspace.')
    .action(async (files, options) => {
      const workspace = await getWorkspace();
      await workspace.preparePackageJSON();
      await workspace.clean();
    });

  cli
    .command(
      'generate [workspaceName]',
      'Generate a workspace for your project.',
    )
    .alias('gen')
    .action(async (workspaceName: string | undefined, options) => {
      await generateWorkspace(workspaceName);
    });

  cli.help();
  cli.parse();
}

main();
