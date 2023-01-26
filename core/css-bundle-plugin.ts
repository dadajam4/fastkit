import { OutputOptions, Plugin } from 'rollup';
import path from 'node:path';
import fs from 'fs-extra';

interface NormalizedOutputOptions extends Omit<OutputOptions, 'file'> {
  file: string;
}

interface Options {
  output: NormalizedOutputOptions;
}

const vanillaSuffixRe = /\.ts\.vanilla\.css$/;

async function removeDirIfEmpty(
  dirPath: string,
  stopDir?: string,
): Promise<void> {
  const files = await fs.readdir(dirPath);

  if (files.length) return;

  await fs.remove(dirPath);
  const { dir } = path.parse(dirPath);
  if (stopDir && stopDir === dir) return;
  return removeDirIfEmpty(dir);
}

export function cssBundlePlugin(options: Options) {
  const { output } = options;
  const _options = { ...options };
  delete (_options as any).output;
  const pkgDir = output.file.split('/dist/')[0];
  const pkgDist = path.join(pkgDir, 'dist');
  const isTool = output.file.startsWith(path.join(pkgDist, 'tool'));
  const myDist = isTool ? path.join(pkgDist, 'tool') : pkgDist;
  const { name } = path.parse(output.file);
  const styleNamePrefixRe = new RegExp(`packages/${name}/src/`);
  const dest = path.join(pkgDist, `${name}.css`);
  const pkgDirName = (() => {
    const tmp = pkgDir.split('/');
    return tmp[tmp.length - 1];
  })();

  const plugin: Plugin = {
    name: 'css-bundle',
    writeBundle: {
      async handler(options, bundle) {
        const targets: {
          fullPath: string;
          styleName: string;
          external: boolean;
        }[] = [];
        const dirs: string[] = [];

        Object.values(bundle).forEach((row) => {
          const { fileName, name: styleName } = row;
          if (!styleName || !vanillaSuffixRe.test(styleName)) return;
          const fullPath = path.join(myDist, fileName);
          const cssPkg = fileName.match(/^assets\/packages\/(.+?)\//)?.[1];
          targets.push({
            fullPath,
            styleName: styleName.replace(styleNamePrefixRe, ''),
            external: cssPkg !== pkgDirName,
          });
        });

        if (!targets.length) {
          return;
        }

        const codes: string[] = (
          await Promise.all(
            targets.map(async (target) => {
              const { fullPath, styleName, external } = target;

              let code = '';
              if (!external) {
                const chunk = await fs.readFile(fullPath, 'utf-8');
                const codePrefix = styleName ? `/* ${styleName} */\n` : '';
                code = `${codePrefix}${chunk}`;
              }
              await fs.remove(fullPath);
              const { dir } = path.parse(fullPath);
              dirs.push(dir);
              return code;
            }),
          )
        ).filter((code) => code.trim().length > 0);

        for (const dir of Array.from(new Set(dirs))) {
          await removeDirIfEmpty(dir, pkgDist);
        }

        if (!codes.length) return;

        let code = codes.join('\n\n');

        if (await fs.exists(dest)) {
          code = `${code}\n\n${await fs.readFile(dest, 'utf-8')}`;
        }

        await fs.writeFile(dest, code);
      },
    },
  };

  return plugin;
}
