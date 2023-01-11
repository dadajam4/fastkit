import { Plugin } from 'vite';
import { MediaMatchGeneratorRunner } from '@fastkit/media-match-gen';
import path from 'node:path';
import { findPackageDir } from '@fastkit/node-util';
import { ViteMediaMatchError } from './logger';
import { UnPromisify } from '@fastkit/helpers';

export interface MediaMatchVitePluginOptions {
  src: string;
  dest?: string;
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
}

let runner: MediaMatchGeneratorRunner | undefined;
let runnerExports: UnPromisify<
  ReturnType<MediaMatchGeneratorRunner['run']>
>['exports'];

export function mediaMatchVitePlugin(
  opts: MediaMatchVitePluginOptions,
): Plugin {
  const { src, onBooted, onBootError } = opts;
  const rawEntryPoint = path.resolve(src);
  const { dest: _dest } = opts;

  return {
    name: 'vite:media-match',
    async config(config, { command }) {
      try {
        let dest: string;

        if (!_dest) {
          const pkgDir = await findPackageDir();
          if (!pkgDir) throw new ViteMediaMatchError('missing package.json');
          dest = path.join(pkgDir, '.media-match');
        } else {
          dest = _dest;
        }

        if (!runner) {
          runner = new MediaMatchGeneratorRunner({
            src: rawEntryPoint,
            dest,
            watch: command === 'serve',
          });
        }

        if (!runnerExports) {
          runnerExports = (await runner.run()).exports;
        }

        const { scss } = runnerExports;
        const scssCachePath = scss.path;

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
          return `@use "${scssCachePath}" as *;\n${source}`;
        };
        scssOptions.additionalData = additionalData;
        config.css = cssOptions;

        onBooted && (await onBooted());

        return config;
      } catch (err) {
        onBootError && (await onBootError(err));
        throw err;
      }
    },
  };
}
