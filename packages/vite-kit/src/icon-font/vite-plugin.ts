import { Plugin } from 'vite';
import { IconFontRunner, RawIconFontOptions } from '@fastkit/icon-font-gen';

export type IconFontVitePlugin = RawIconFontOptions;

export function iconFontVitePlugin(opts: IconFontVitePlugin): Plugin {
  return {
    name: 'vite:icon-font',
    async config(config, { command }) {
      const watch = command === 'serve';
      const runner = new IconFontRunner(opts, watch);
      await runner.run();
      return config;
    },
  };
}
