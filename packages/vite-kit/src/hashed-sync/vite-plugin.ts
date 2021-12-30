import { Plugin } from 'vite';
import { HashedSync, HashedSyncOptions } from '@fastkit/hashed-sync';

export interface HashedSyncVitePluginOptions
  extends Omit<HashedSyncOptions, 'watch'> {
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
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

        onBooted && (await onBooted());

        return config;
      } catch (err) {
        onBootError && (await onBootError(err));
        throw err;
      }
    },
  };
}
