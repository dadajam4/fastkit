import { Plugin } from 'vite';
import { HashedSync, HashedSyncOptions } from '@fastkit/hashed-sync';

export type HashedSyncVitePluginOptions = Omit<HashedSyncOptions, 'watch'>;

export function hashedSyncVitePlugin(
  opts: HashedSyncVitePluginOptions,
): Plugin {
  return {
    name: 'vite:hashed-sync',
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
