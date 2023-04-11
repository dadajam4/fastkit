import { cac } from 'cac';
import path from 'node:path';
import {
  DEFAULT_DEST_DIRNAME,
  DEFAULT_CONFIG_FILENAME,
  IconFontConfig,
} from './schemes';
import { generate } from './generator';
import { findPackageDir, esbuildRequire } from '@fastkit/node-util';
import { IconFontGenError } from './logger';
import pkg from '../package.json';

export async function cli() {
  const cli = cac('icon-font');

  cli
    .option('-d, --dest <string>', 'Destination for generated fonts.', {
      default: path.join(process.cwd(), `${DEFAULT_DEST_DIRNAME}`),
    })
    .command(
      '[config file path]',
      `
Path of the configuration file. (default: [your package directory]${path.sep}${DEFAULT_CONFIG_FILENAME})
    You must export default <IconFontConfig>.

    e.g.
    \`\`\`
    import { ceateIconFontConfig } from '@fastkit/icon-font-gen';

    export default ceateIconFontConfig({ ... });
    \`\`\`
      `.trim(),
    )
    .action(
      async (configPath: string | undefined, options: { dest: string }) => {
        if (!configPath) {
          const pkgDir = await findPackageDir();
          if (!pkgDir) {
            throw new IconFontGenError('missing package directory.');
          }
          configPath = path.join(pkgDir, DEFAULT_CONFIG_FILENAME);
        }

        const dest = path.resolve(options.dest);
        const mod = await esbuildRequire<{ default: IconFontConfig }>(
          configPath,
        );
        const config = mod.exports.default;

        await generate({
          ...config,
          dest,
        });
      },
    );

  cli.help();

  cli.version(pkg.version);

  cli.parse();
}

cli();
