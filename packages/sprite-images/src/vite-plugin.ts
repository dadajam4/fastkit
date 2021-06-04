import { Plugin } from 'vite';
import { SpriteImagesRunner } from './generator';
import { SpriteImagesOptions } from '../schemes';

export function spriteImagesVitePlugin(opts: SpriteImagesOptions): Plugin {
  return {
    name: 'spriteImages',
    async config(config) {
      const runner = new SpriteImagesRunner(opts);
      await runner.run();
      return config;
    },
  };
}
