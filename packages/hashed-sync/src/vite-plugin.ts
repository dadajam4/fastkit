import { Plugin } from 'vite';
import { HashedSyncOptions } from './schemes';
import { HashedSync } from './hashed-sync';

export type HashedSyncVitePluginOptions = Omit<HashedSyncOptions, 'watch'>;

export function hashedSyncVitePlugin(
  opts: HashedSyncVitePluginOptions,
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
