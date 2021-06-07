import { Plugin } from 'vite';
import { MediaMatchGeneratorRunner } from './generator';
import path from 'path';
import { findPackageDir } from '@fastkit/node-util';
import { MediaMatchGenError } from './logger';

export interface MediaMatchPluginOptions {
  src: string;
  dest?: string;
}

export function mediaMatchVitePlugin(opts: MediaMatchPluginOptions): Plugin {
  const { src } = opts;
  const rawEntryPoint = path.resolve(src);
  const { dest: _dest } = opts;

  return {
    name: 'mediaMatch',
    async config(config, { command }) {
      let dest: string;

      if (!_dest) {
        const pkgDir = await findPackageDir();
        if (!pkgDir) throw new MediaMatchGenError('missing package.json');
        dest = path.join(pkgDir, '.media-match');
      } else {
        dest = _dest;
      }

      const runner = new MediaMatchGeneratorRunner({
        src: rawEntryPoint,
        dest,
        watch: command === 'serve',
      });

      const { scss } = (await runner.run()).exports;
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
        return `@import "${scssCachePath}";\n${source}`;
      };
      scssOptions.additionalData = additionalData;
      config.css = cssOptions;
      return config;
    },
  };
}
