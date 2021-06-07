import { Plugin } from 'vite';
import { IconFontRunner } from './generator';
import { RawIconFontOptions } from './schemes';

export type IconFontVitePlugin = RawIconFontOptions;

export function iconFontVitePlugin(opts: IconFontVitePlugin): Plugin {
  return {
    name: 'iconFont',
    async config(config, { command }) {
      const watch = command === 'serve';
      const runner = new IconFontRunner(opts, watch);
      await runner.run();
      return config;
    },
  };
}
