import { Plugin } from 'vite';
import { IconFontRunner } from './generator';
import { RawIconFontOptions } from '../schemes';
export { RawIconFontOptions } from '../schemes';

export function iconFontVitePlugin(opts: RawIconFontOptions): Plugin {
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
