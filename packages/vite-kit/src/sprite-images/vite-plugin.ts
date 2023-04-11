import { Plugin } from 'vite';
import {
  SpriteImagesRunner,
  SpriteImagesOptions,
} from '@fastkit/sprite-images';

export interface SpriteImagesVitePluginOptions extends SpriteImagesOptions {
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
}

let runner: SpriteImagesRunner | undefined;

export function spriteImagesVitePlugin(
  opts: SpriteImagesVitePluginOptions,
): Plugin {
  return {
    name: 'vite:sprite-images',
    async config(config) {
      const { onBooted, onBootError } = opts;
      try {
        if (!runner) {
          const runner = new SpriteImagesRunner(opts);
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
