import { Plugin } from 'vite';
import { SpriteImagesRunner } from './generator';
import { SpriteImagesOptions } from './schemes';

export type SpriteImagesVitePluginOptions = SpriteImagesOptions;

export function spriteImagesVitePlugin(
  opts: SpriteImagesVitePluginOptions,
): Plugin {
  return {
    name: 'spriteImages',
    async config(config) {
      const runner = new SpriteImagesRunner(opts);
      await runner.run();
      return config;
    },
  };
}
