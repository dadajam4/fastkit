import { Plugin } from 'vite';
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit';
import path from 'path';
import fs from 'fs-extra';
import { findPackageDir } from '@fastkit/node-util';
import { RawIconFontEntry, IconFontSettings } from '@fastkit/icon-font-gen';
import { VuiServiceOptions } from '@fastkit/vui';

const COLOR_DUMP_STYLE = `@include dump-color-scheme(true);`;

async function defaultDynamicDest() {
  const pkgDir = await findPackageDir();
  if (!pkgDir) {
    throw new Error(`missing package directory`);
  }
  return path.join(pkgDir, '.vui');
}

async function getBuiltinsDir() {
  // const cwd = process.cwd();
  const pkgDir = await findPackageDir();
  if (!pkgDir) {
    throw new Error(`missing package directory`);
  }

  // For development...
  // console.log('■■■', cwd);
  // if (cwd.endsWith('/docs')) {
  //   const result = path.resolve(cwd, '../packages/vui/src/assets/builtins');
  //   return result;
  // }

  return path.join(pkgDir, 'node_modules/@fastkit/vui/dist/assets/builtins');
}

export interface ViteVuiPluginOptions
  extends Partial<Pick<VuiServiceOptions, 'colors' | 'icons'>> {
  dynamicDest?: string;
  colorScheme?: string;
  mediaMatch?: string;
  iconFont?: RawIconFontEntry[];
  iconFontDefaults?: IconFontSettings;
  onBooted?: () => any;
  onBootError?: (err: unknown) => any;
  __dev?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ViteVuiPluginResultSettings
  extends Pick<VuiServiceOptions, 'colors' | 'icons'> {
  colorScheme: string;
  mediaMatch: string;
  __dev?: boolean;
}

export interface ViteVuiPluginResult {
  settings: ViteVuiPluginResultSettings;
  plugins: (Plugin | Plugin[])[];
  dest: string;
}

export async function ViteVuiPlugin(
  options: ViteVuiPluginOptions = {},
): Promise<ViteVuiPluginResult> {
  const plugins: (Plugin | Plugin[])[] = [];

  const builtinsDir = await getBuiltinsDir();
  const {
    colorScheme = path.join(builtinsDir, 'color-scheme'),
    mediaMatch = path.join(builtinsDir, 'media-match'),
    iconFont,
    iconFontDefaults,
    onBooted,
    onBootError,
    colors = {
      primary: 'primary' as any,
      error: 'error' as any,
    } as VuiServiceOptions['colors'],
    icons = {
      menuDown: 'mdi-menu-down' as any,
    } as VuiServiceOptions['icons'],
    __dev,
  } = options;

  let { dynamicDest } = options;

  if (!dynamicDest) {
    if (options.__dev) {
      dynamicDest = path.resolve(__dirname, '../../../../docs/.vui');
    } else {
      dynamicDest = await defaultDynamicDest();
    }
  }

  const colorSchemeSrc = path.resolve(colorScheme);
  const colorSchemeDest = path.join(dynamicDest, 'color-scheme');
  const mediaMatchDest = path.join(dynamicDest, 'media-match');
  const dts = `
/// <reference path="./color-scheme/color-scheme.info.ts" />
/// <reference path="./icon-font/index.ts" />
/// <reference path="./media-match/media-match.ts" />
export {};
  `.trim();

  await fs.ensureDir(dynamicDest);
  await fs.writeFile(path.join(dynamicDest, 'setup.scss'), COLOR_DUMP_STYLE);
  await fs.writeFile(path.join(dynamicDest, 'vui.d.ts'), dts);

  let iconFontEntries: RawIconFontEntry[] = iconFont || [
    {
      src: '@mdi',
    },
  ];

  if (iconFontDefaults) {
    iconFontEntries = iconFontEntries.map((entry) => {
      return {
        ...iconFontDefaults,
        ...entry,
      };
    });
  }

  plugins.push(
    dynamicSrcVitePlugin({
      colorScheme: {
        src: colorSchemeSrc,
        dest: colorSchemeDest,
      },
      mediaMatch: {
        src: path.resolve(mediaMatch),
        dest: mediaMatchDest,
      },
      iconFont: {
        entries: iconFontEntries,
        dest: path.join(dynamicDest, 'icon-font'),
      },
      onBooted,
      onBootError,
    }),
  );

  const plugin: Plugin = {
    name: 'vite:vui',
    enforce: 'pre',
    config(config) {
      const ssr = (config as any).ssr || {};
      ssr.noExternal = ssr.noExternal || [];
      ssr.noExternal.push(/\/vui\/dist\/assets\//);
      // ssr.noExternal.push(/\/fastkit\//);

      (config as any).ssr = ssr;
      return config;
    },
  };

  plugins.push(plugin);
  return {
    plugins,
    dest: dynamicDest,
    settings: {
      colorScheme: path.join(colorSchemeDest, 'color-scheme.info'),
      mediaMatch: path.join(mediaMatchDest, 'media-match'),
      colors,
      icons,
      __dev,
    },
  };
}
