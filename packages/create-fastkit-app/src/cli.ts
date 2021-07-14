import { cac } from 'cac';
import { prompt } from './prompt';
import { scaffold } from './scaffold';

const { version } = require('../package.json');

export function cli() {
  const cli = cac('create-fastkit-app');

  cli
    .command('[out-dir]', 'Generate in a custom directory or current directory')
    .action(async (outDir = '') => {
      const config = await prompt({
        dest: outDir,
      });
      return scaffold(config);
    });

  cli.help();

  cli.version(version);

  cli.parse();
}
