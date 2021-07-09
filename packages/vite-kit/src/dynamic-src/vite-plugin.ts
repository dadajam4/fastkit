import { Plugin, PluginOption } from 'vite';

import {
  ColorSchemeVitePluginOptions,
  colorSchemeVitePlugin,
} from '../color-scheme';
import {
  HashedSyncVitePluginOptions,
  hashedSyncVitePlugin,
} from '../hashed-sync';
import { IconFontVitePlugin, iconFontVitePlugin } from '../icon-font';
import {
  MediaMatchVitePluginOptions,
  mediaMatchVitePlugin,
} from '../media-match';
import {
  SpriteImagesVitePluginOptions,
  spriteImagesVitePlugin,
} from '../sprite-images';

export interface DynamicSrcVitePluginOptions {
  colorScheme?: ColorSchemeVitePluginOptions;
  hashedSync?: HashedSyncVitePluginOptions;
  iconFont?: IconFontVitePlugin;
  mediaMatch?: MediaMatchVitePluginOptions;
  spriteImages?: SpriteImagesVitePluginOptions;
}

export function dynamicSrcVitePlugin(
  opts: DynamicSrcVitePluginOptions,
): Plugin {
  return {
    name: 'vite:dynamic-src',
    config() {
      const { colorScheme, hashedSync, iconFont, mediaMatch, spriteImages } =
        opts;
      const plugins: PluginOption[] = [];

      if (colorScheme) {
        plugins.push(colorSchemeVitePlugin(colorScheme));
      }
      if (hashedSync) {
        plugins.push(hashedSyncVitePlugin(hashedSync) as Plugin);
      }
      if (iconFont) {
        plugins.push(iconFontVitePlugin(iconFont));
      }
      if (mediaMatch) {
        plugins.push(mediaMatchVitePlugin(mediaMatch));
      }
      if (spriteImages) {
        plugins.push(spriteImagesVitePlugin(spriteImages));
      }

      return {
        plugins,
      };
    },
  };
}
