import { Plugin } from 'vite';
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit';
import path from 'node:path';
import fs from 'fs-extra';
import { RawIconFontEntry, IconFontSettings } from '@fastkit/icon-font-gen';
import { VuiServiceOptions } from '@fastkit/vui';
import { render } from 'eta';
import { VitePluginVuiError } from './logger';

const COLOR_DUMP_STYLE = `@layer vui-normalize, vui-color-scheme, vui; @include dump-color-scheme(true, "vui-color-scheme");`;

const TEMPLATE = `
/* eslint-disable */
// @ts-nocheck
import '@fastkit/vue-stack/vue-stack.css';
import '@fastkit/vue-app-layout/vue-app-layout.css';
import '@fastkit/vue-loading/vue-loading.css';
import '@fastkit/vue-scroller/vue-scroller.css';
import '@fastkit/vui/vui.css';
import './setup.scss';
import type { App } from 'vue';
import type { Router } from 'vue-router';
import { VPageLink } from '@fastkit/vue-page';
import { installVuiPlugin as _installVuiPlugin, RawVuiPluginOptions, mergeVuiPluginOptions } from '@fastkit/vui';
import { colorScheme } from '<%~ it.colorScheme %>';
import '<%~ it.mediaMatch %>';
import './icon-font';
import '@fastkit/vui/after-effects.scss';

export function installVui(settings: { app: App, router: Router }, options?: RawVuiPluginOptions) {
  const merged = mergeVuiPluginOptions({
    RouterLink: VPageLink,
    colorScheme,
    uiSettings: <%~ it.uiSettings %>,
    icons: <%~ it.icons %>,
    ...settings,
  }, options);
  _installVuiPlugin(settings.app, merged);
}

export default installVui;
`.trim();

async function renderTemplate({
  colorScheme,
  mediaMatch,
  uiSettings,
  icons,
}: ViteVuiPluginResultSettings) {
  const result = await render(
    TEMPLATE,
    {
      colorScheme,
      mediaMatch,
      uiSettings: JSON.stringify(uiSettings),
      icons: JSON.stringify(icons),
    },
    { async: true },
  );
  if (!result) {
    throw new VitePluginVuiError('template render error.');
  }
  return result;
}

function defaultDynamicDest() {
  return path.resolve('.vui');
}

function getBuiltinsDir() {
  return __plugboyWorkspaceDir('node_modules/@fastkit/vui/dist/builtins');
}

export interface ViteVuiPluginOptions
  extends Partial<Pick<VuiServiceOptions, 'uiSettings' | 'icons'>> {
  dynamicDest?: string;
  colorScheme?: string;
  mediaMatch?: string;
  iconFont?: RawIconFontEntry[];
  iconFontDefaults?: IconFontSettings;
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
}

export interface ViteVuiPluginResultSettings
  extends Pick<VuiServiceOptions, 'uiSettings' | 'icons'> {
  colorScheme: string;
  mediaMatch: string;
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
    uiSettings = {
      primaryScope: 'primary' as any,
      plainVariant: 'plain' as any,
      containedVariant: 'contained' as any,
      warningScope: 'warning' as any,
      errorScope: 'error' as any,
      buttonDefault: {
        color: 'base' as any,
        variant: 'contained' as any,
      },
      tabDefault: {
        color: 'accent' as any,
      },
      dialogOk: {
        color: 'primary' as any,
      },
    },
    icons = {
      menuDown: 'mdi-menu-down' as any,
      navigationExpand: 'mdi-menu-down' as any,
      prev: 'mdi-chevron-left' as any,
      next: 'mdi-chevron-right' as any,
      sort: 'mdi-chevron-down' as any,
      editorTextColor: 'mdi-format-color-text' as any,
      editorformatBold: 'mdi-format-bold' as any,
      editorformatUnderline: 'mdi-format-underline' as any,
      editorformatItalic: 'mdi-format-italic' as any,
      editorformatListBulleted: 'mdi-format-list-bulleted' as any,
      editorformatListNumbered: 'mdi-format-list-numbered' as any,
      editorLink: 'mdi-link' as any,
      editorLinkOff: 'mdi-link-off' as any,
      editorUndo: 'mdi-undo-variant' as any,
      editorRedo: 'mdi-redo-variant' as any,
      hinttip: 'mdi-help-circle-outline' as any,
      clear: 'mdi-close' as any,
      reload: 'mdi-reload' as any,
      // navigationExpand: (gen, active) => {
      //   return gen({
      //     name: 'mdi-menu-down' as any,
      //     rotate: active ? 180 : 0,
      //   });
      // },
      ...options.icons,
    } as VuiServiceOptions['icons'],
  } = options;

  let dynamicDest: string;

  const { dynamicDest: _dynamicDest } = options;

  if (!_dynamicDest) {
    dynamicDest = defaultDynamicDest();
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
      ssr.noExternal.push(/\/vui\/dist\/builtins\//);

      (config as any).ssr = ssr;
      return config;
    },
  };

  plugins.push(plugin);

  const settings = {
    colorScheme: path.join(colorSchemeDest, 'color-scheme.info'),
    mediaMatch: path.join(mediaMatchDest, 'media-match'),
    uiSettings,
    icons,
  };

  return {
    plugins,
    dest: dynamicDest,
    settings,
  };
}
