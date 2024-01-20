import { cac } from 'cac';
import path from 'node:path';
import { findPackageDir, esbuildRequire } from '@fastkit/node-util';
import {
  DEFAULT_DEST_DIRNAME,
  DEFAULT_CONFIG_FILENAME,
  IconFontConfig,
} from './schemes';
import { generate } from './generator';
import { IconFontGenError } from './logger';
import pkg from '../package.json';

export async function cli() {
  const _cli = cac('icon-font');

  _cli
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
    import { createIconFontConfig } from '@fastkit/icon-font-gen';

    export default createIconFontConfig({ ... });
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

  _cli.help();

  _cli.version(pkg.version);

  _cli.parse();
}

cli();
