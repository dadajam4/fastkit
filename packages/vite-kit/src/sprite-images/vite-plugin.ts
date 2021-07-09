import { Plugin } from 'vite';
import {
  SpriteImagesRunner,
  SpriteImagesOptions,
} from '@fastkit/sprite-images';

export type SpriteImagesVitePluginOptions = SpriteImagesOptions;

export function spriteImagesVitePlugin(
  opts: SpriteImagesVitePluginOptions,
): Plugin {
  return {
    name: 'vite:sprite-images',
    async config(config) {
      const runner = new SpriteImagesRunner(opts);
      await runner.run();
      return config;
    },
  };
}
