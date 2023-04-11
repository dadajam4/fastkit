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
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
}

let booted = false;
let bootWait: Promise<any> | undefined;

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
      onBooted: (() => any) | (() => Promise<any>),
      onBootError: ((err: unknown) => any) | ((err: unknown) => Promise<any>),
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
    async config(config, env) {
      try {
        await Promise.all(promises);
        if (onBooted) {
          if (!booted) {
            booted = true;
            bootWait = onBooted();
          }
          await bootWait;
        }
        return config;
      } catch (err) {
        onBootError && (await onBootError(err));
        throw err;
      }
    },
  };

  plugins.push(dynamicSrcPlugin);

  return plugins;
}
