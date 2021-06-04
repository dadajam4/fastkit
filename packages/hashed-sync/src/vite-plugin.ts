import { Plugin } from 'vite';
import { HashedSyncOptions } from './schemes';
import { HashedSync } from './hashed-sync';

export function hashedSyncVitePlugin(
  opts: Omit<HashedSyncOptions, 'watch'>,
): Plugin {
  return {
    name: 'hashedSync',
    async config(config, { command }) {
      const hashedSync = new HashedSync({
        ...opts,
        watch: command === 'serve',
      });
      await hashedSync.loadAndSync();
      return config;
    },
  };
}
