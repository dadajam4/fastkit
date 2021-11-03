import { Plugin } from 'vite';
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit';
import path from 'path';
import fs from 'fs-extra';
import { findPackageDirSync } from '@fastkit/node-util';
import { RawIconFontEntry, IconFontSettings } from '@fastkit/icon-font-gen';
import { VuiServiceOptions } from '@fastkit/vui';
import { render } from 'eta';
import { VuiError } from '../logger';

const COLOR_DUMP_STYLE = `@include dump-color-scheme(true);`;

const TEMPLATE = `
/* eslint-disable */
// @ts-nocheck
import '@fastkit/vue-stack/dist/vue-stack.css';
import '@fastkit/vue-app-layout/dist/vue-app-layout.css';
import '@fastkit/vui/dist/vui.css';
import './setup.scss';
import type { App } from 'vue';
import { installVuiPlugin as _installVuiPlugin } from '@fastkit/vui';
import { colorScheme } from '<%~ it.colorScheme %>';
import '<%~ it.mediaMatch %>';
import './icon-font';

export function installVui(app: App) {
  _installVuiPlugin(app, {
    colorScheme,
    colors: <%~ it.colors %>,
    icons: <%~ it.icons %>,
  });
}

export default installVui;
`.trim();

async function renderTemplate({
  colorScheme,
  mediaMatch,
  colors,
  icons,
}: ViteVuiPluginResultSettings) {
  const result = await render(
    TEMPLATE,
    {
      colorScheme,
      mediaMatch,
      colors: JSON.stringify(colors),
      icons: JSON.stringify(icons),
    },
    { async: true },
  );
  if (!result) {
    throw new VuiError('template render error.');
  }
  return result;
}

function defaultDynamicDest() {
  // const pkgDir = findPackageDirSync();
  // if (!pkgDir) {
  //   throw new Error(`missing package directory`);
  // }
  // return path.join(pkgDir, '.vui');
  return path.resolve('.vui');
}

function getBuiltinsDir() {
  // const cwd = process.cwd();
  const pkgDir = findPackageDirSync();
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

export function viteVuiPlugin(
  options: ViteVuiPluginOptions = {},
): ViteVuiPluginResult {
  const plugins: (Plugin | Plugin[])[] = [];

  const builtinsDir = getBuiltinsDir();
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

  let dynamicDest: string;

  const { dynamicDest: _dynamicDest } = options;

  if (!_dynamicDest) {
    if (options.__dev) {
      dynamicDest = path.resolve(__dirname, '../../../../docs/.vui');
    } else {
      dynamicDest = defaultDynamicDest();
    }
  } else {
    dynamicDest = _dynamicDest;
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

  fs.ensureDirSync(dynamicDest);
  fs.writeFileSync(path.join(dynamicDest, 'setup.scss'), COLOR_DUMP_STYLE);
  fs.writeFileSync(path.join(dynamicDest, 'vui.d.ts'), dts);

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
    async config(config) {
      await fs.writeFile(
        path.join(dynamicDest, 'installer.ts'),
        await renderTemplate(settings),
      );

      const ssr = (config as any).ssr || {};
      ssr.noExternal = ssr.noExternal || [];
      ssr.noExternal.push(/\/vui\/dist\/assets\//);
      // ssr.noExternal.push(/\/fastkit\//);

      (config as any).ssr = ssr;
      return config;
    },
  };

  plugins.push(plugin);

  const settings = {
    colorScheme: path.join(colorSchemeDest, 'color-scheme.info'),
    mediaMatch: path.join(mediaMatchDest, 'media-match'),
    colors,
    icons,
    __dev,
  };

  return {
    plugins,
    dest: dynamicDest,
    settings,
  };
}