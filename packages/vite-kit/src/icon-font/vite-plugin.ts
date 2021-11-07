import { Plugin } from 'vite';
import { IconFontRunner, IconFontOptions } from '@fastkit/icon-font-gen';

export interface IconFontVitePlugin extends IconFontOptions {
  onBooted?: () => any;
  onBootError?: (err: unknown) => any;
}

let runner: IconFontRunner | undefined;

export function iconFontVitePlugin(opts: IconFontVitePlugin): Plugin {
  return {
    name: 'vite:icon-font',
    async config(config, { command }) {
      const { onBooted, onBootError } = opts;
      try {
        if (!runner) {
          const watch = command === 'serve';
          runner = new IconFontRunner(opts, watch);
          await runner.run();
        }
        onBooted && onBooted();
        return config;
      } catch (err) {
        onBootError && onBootError(err);
        throw err;
      }
    },
  };
}
