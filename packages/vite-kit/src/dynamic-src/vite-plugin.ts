import { Plugin } from 'vite';

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
  onBooted?: () => any;
  onBootError?: (err: unknown) => any;
}

export function dynamicSrcVitePlugin(
  opts: DynamicSrcVitePluginOptions,
): Plugin[] {
  const {
    colorScheme,
    hashedSync,
    iconFont,
    mediaMatch,
    spriteImages,
    onBooted,
    onBootError,
  } = opts;
  const plugins: Plugin[] = [];
  const promises: Promise<any>[] = [];

  function pushPlugin(
    createPlugin: (
      onBooted: () => any,
      onBootError: (err: unknown) => any,
    ) => Plugin,
  ) {
    const promise = new Promise<void>((resolve, reject) => {
      const plugin = createPlugin(resolve, reject);
      plugins.push(plugin);
    });
    promises.push(promise);
  }

  if (colorScheme) {
    pushPlugin((onBooted) => {
      return colorSchemeVitePlugin({
        ...colorScheme,
        onBooted,
      });
    });
  }

  if (hashedSync) {
    pushPlugin((onBooted) => {
      return hashedSyncVitePlugin({
        ...hashedSync,
        onBooted,
      });
    });
  }

  if (iconFont) {
    pushPlugin((onBooted) => {
      return iconFontVitePlugin({
        ...iconFont,
        onBooted,
      });
    });
  }

  if (mediaMatch) {
    pushPlugin((onBooted) => {
      return mediaMatchVitePlugin({
        ...mediaMatch,
        onBooted,
      });
    });
  }

  if (spriteImages) {
    pushPlugin((onBooted) => {
      return spriteImagesVitePlugin({
        ...spriteImages,
        onBooted,
      });
    });
  }

  const dynamicSrcPlugin: Plugin = {
    name: 'vite:dynamic-src',
    async config(config) {
      try {
        await Promise.all(promises);
        onBooted && onBooted();
        return config;
      } catch (err) {
        onBootError && onBootError(err);
        throw err;
      }
    },
  };

  plugins.push(dynamicSrcPlugin);

  return plugins;
}
