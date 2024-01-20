import { Plugin } from 'vite';
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen';
import path from 'node:path';
import { findPackageDir } from '@fastkit/node-util';
import { UnPromisify } from '@fastkit/helpers';
import { ViteColorSchemeError } from './logger';

export interface ColorSchemeVitePluginOptions {
  src: string;
  dest?: string;
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: (err: unknown) => any;
}

let runner: LoadColorSchemeRunner | undefined;
let cachePaths: UnPromisify<
  ReturnType<LoadColorSchemeRunner['run']>
>['exports']['cachePaths'];

export function colorSchemeVitePlugin(
  opts: ColorSchemeVitePluginOptions,
): Plugin {
  const { src, dest: _dest, onBooted, onBootError } = opts;

  const rawEntryPoint = path.resolve(src);

  return {
    name: 'vite:color-scheme',
    async config(config, { command }) {
      try {
        let dest: string;

        if (!_dest) {
          const pkgDir = await findPackageDir();
          if (!pkgDir) throw new ViteColorSchemeError('missing package.json');
          dest = path.join(pkgDir, '.color-scheme');
        } else {
          dest = _dest;
        }

        if (!runner) {
          runner = new LoadColorSchemeRunner({
            entry: rawEntryPoint,
            dest,
            watch: command === 'serve',
          });
        }

        if (!cachePaths) {
          cachePaths = (await runner.run()).exports.cachePaths;
        }

        const cssOptions = {
          ...config.css,
        };
        cssOptions.preprocessorOptions = {
          ...cssOptions.preprocessorOptions,
        };
        const { preprocessorOptions } = cssOptions;
        preprocessorOptions.scss = {
          ...preprocessorOptions.scss,
        };
        const scssOptions = preprocessorOptions.scss;

        const _additionalData = scssOptions.additionalData;
        const additionalData = (source: string, filename: string) => {
          if (typeof _additionalData === 'string') {
            source = _additionalData + source;
          } else if (typeof _additionalData === 'function') {
            source = _additionalData(source, filename);
          }
          return `@use "${cachePaths.scss}" as *;\n${source}`;
        };
        scssOptions.additionalData = additionalData;
        config.css = cssOptions;

        onBooted && (await onBooted());

        return config;
      } catch (err) {
        onBootError && onBootError(err);
        throw err;
      }
    },
  };
}
