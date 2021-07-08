import { Plugin, PluginOption } from 'vite';

import {
  ColorSchemeVitePluginOptions,
  colorSchemeVitePlugin,
} from '@fastkit/color-scheme-gen';
import {
  HashedSyncVitePluginOptions,
  hashedSyncVitePlugin,
} from '@fastkit/hashed-sync';
import { IconFontVitePlugin, iconFontVitePlugin } from '@fastkit/icon-font-gen';
import {
  MediaMatchVitePluginOptions,
  mediaMatchVitePlugin,
} from '@fastkit/media-match-gen';
import {
  SpriteImagesVitePluginOptions,
  spriteImagesVitePlugin,
} from '@fastkit/sprite-images';

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
    name: 'dynamicSrc',
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
