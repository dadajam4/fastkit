import { Plugin } from 'vite';
import { HashedSync, HashedSyncOptions } from '@fastkit/hashed-sync';

export interface HashedSyncVitePluginOptions
  extends Omit<HashedSyncOptions, 'watch'> {
  onBooted?: () => any;
  onBootError?: (err: unknown) => any;
}

let hashedSync: HashedSync | undefined;

export function hashedSyncVitePlugin(
  opts: HashedSyncVitePluginOptions,
): Plugin {
  return {
    name: 'vite:hashed-sync',
    async config(config, { command }) {
      const { onBooted, onBootError } = opts;

      try {
        if (!hashedSync) {
          hashedSync = new HashedSync({
            ...opts,
            watch: command === 'serve',
          });
          await hashedSync.loadAndSync();
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
