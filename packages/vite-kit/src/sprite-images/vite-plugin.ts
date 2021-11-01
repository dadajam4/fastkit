import { Plugin } from 'vite';
import {
  SpriteImagesRunner,
  SpriteImagesOptions,
} from '@fastkit/sprite-images';

export interface SpriteImagesVitePluginOptions extends SpriteImagesOptions {
  onBooted?: () => any;
  onBootError?: (err: unknown) => any;
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

        onBooted && onBooted();
        return config;
      } catch (err) {
        onBootError && onBootError(err);
        throw err;
      }
    },
  };
}
