import { Plugin } from 'vite';
import { IconFontRunner, IconFontOptions } from '@fastkit/icon-font-gen';

export interface IconFontVitePlugin extends IconFontOptions {
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
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
        onBooted && (await onBooted());
        return config;
      } catch (err) {
        onBootError && (await onBootError(err));
        throw err;
      }
    },
  };
}
