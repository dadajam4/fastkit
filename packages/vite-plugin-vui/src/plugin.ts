import { Plugin } from 'vite';
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit';
import path from 'node:path';
import fs from 'fs-extra';
import { RawIconFontEntry, IconFontSettings } from '@fastkit/icon-font-gen';
import { VuiServiceOptions } from '@fastkit/vui';
import { Eta } from 'eta';
import module from 'node:module';
import { VitePluginVuiError } from './logger';

const COLOR_DUMP_STYLE = `${`
/* stylelint-disable */
@use './color-scheme/color-scheme' as *;
@layer vui-normalize, vui-color-scheme, vue-disabled-reason, vue-loading, vue-app-layout, vui;
@include dump-color-scheme(true, "vui-color-scheme");
@import '@fastkit/vui/builtins.css';
`.trim()}\n`;

const TEMPLATE = `
/* eslint-disable */
// @ts-nocheck
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
  const eta = new Eta();
  const result = await eta.renderStringAsync(TEMPLATE, {
    colorScheme,
    mediaMatch,
    uiSettings: JSON.stringify(uiSettings),
    icons: JSON.stringify(icons),
  });
  if (!result) {
    throw new VitePluginVuiError('template render error.');
  }
  return result;
}

function defaultDynamicDest() {
  return path.resolve('.vui');
}

const require = module.createRequire(import.meta.url);

/**
 * Where `@fastkit/vui` keeps the default color-scheme and media-match sources.
 *
 * Resolved through vui's own exports rather than assembled as
 * `<pkgDir>/node_modules/@fastkit/vui/dist/builtins`: that path only exists when
 * vui happens to be installed *inside* this package's directory, which no
 * package manager guarantees. pnpm puts a package's dependencies beside it in
 * the virtual store, with no `node_modules` in the package directory at all, and
 * npm hoists them to the root — so the assembled path was simply absent for
 * anyone who installed this plugin, and the defaults could not be used.
 */
function getBuiltinsDir() {
  return path.dirname(require.resolve('@fastkit/vui/builtins/color-scheme.ts'));
}

/**
 * Packages the generated tree imports by name.
 *
 * The files this plugin writes live in the consumer's project, so these resolve
 * from there — not from this package. They are declared as required peers for
 * exactly that reason, but a peer declaration cannot place them: pnpm only puts
 * what the project itself declares into its `node_modules`, and an
 * auto-installed peer lands in the virtual store where the generated tree cannot
 * see it. So check, and say what is missing.
 *
 * Left unchecked, the consumer gets the symptom instead of the cause: the
 * `declare module` augmentations in the generated tree resolve nothing, every
 * icon name and color scope falls back to its placeholder type, and `tsc`
 * reports hundreds of `TS2322` while the generator and `vite build` both
 * succeed.
 */
const GENERATED_TREE_IMPORTS = [
  '@fastkit/color-scheme',
  '@fastkit/icon-font',
  '@fastkit/media-match',
  '@fastkit/vue-page',
  '@fastkit/vui',
  'vue',
  'vue-router',
];

function assertGeneratedTreeIsResolvable(dynamicDest: string) {
  // Resolution is attempted from the generated tree itself, since that is where
  // the imports will be resolved from.
  const from = module.createRequire(path.join(dynamicDest, 'index.js'));
  const missing = GENERATED_TREE_IMPORTS.filter((name) => {
    try {
      // `<name>/package.json`, not `<name>`: these packages export only the
      // `import` condition, so a bare specifier throws under `createRequire`
      // even when installed.
      from.resolve(`${name}/package.json`);
      return false;
    } catch (err) {
      // Present, but not exporting `./package.json`.
      return (
        (err as NodeJS.ErrnoException).code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED'
      );
    }
  });
  if (!missing.length) return;

  throw new VitePluginVuiError(
    [
      `Cannot resolve ${missing.map((name) => `\`${name}\``).join(', ')} from ${dynamicDest}.`,
      '',
      'The code this plugin generates there imports them by name, so they have to be',
      'resolvable from your project — a transitive install is not enough, and neither is',
      'an auto-installed peer dependency. Add them to your project:',
      '',
      `  pnpm add ${missing.join(' ')}`,
      '',
      'They must be the same copies the rest of your app uses: the generated code augments',
      'their module declarations to replace placeholder types with your real icon names,',
      'color scopes and media-match keys.',
    ].join('\n'),
  );
}

export interface ViteVuiPluginOptions extends Partial<
  Pick<VuiServiceOptions, 'uiSettings' | 'icons'>
> {
  dynamicDest?: string;
  colorScheme?: string;
  mediaMatch?: string;
  iconFont?: RawIconFontEntry[];
  iconFontDefaults?: IconFontSettings;
  onBooted?: (() => any) | (() => Promise<any>);
  onBootError?: ((err: unknown) => any) | ((err: unknown) => Promise<any>);
}

export interface ViteVuiPluginResultSettings extends Pick<
  VuiServiceOptions,
  'uiSettings' | 'icons'
> {
  colorScheme: string;
  mediaMatch: string;
}

export interface ViteVuiPluginResult {
  settings: ViteVuiPluginResultSettings;
  plugins: (Plugin | Plugin[])[];
  dest: string;
}

export async function viteVuiPlugin(
  options: ViteVuiPluginOptions = {},
): Promise<ViteVuiPluginResult> {
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
      editorAlignLeft: 'mdi-format-align-left' as any,
      editorAlignCenter: 'mdi-format-align-center' as any,
      editorAlignRight: 'mdi-format-align-right' as any,
      editorAlignJustify: 'mdi-format-align-justify' as any,
      editorLink: 'mdi-link' as any,
      editorLinkOff: 'mdi-link-off' as any,
      editorUndo: 'mdi-undo-variant' as any,
      editorRedo: 'mdi-redo-variant' as any,
      hinttip: 'mdi-help-circle-outline' as any,
      clear: 'mdi-close' as any,
      reload: 'mdi-reload' as any,
      fileUpload: 'mdi-file-upload' as any,
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

  assertGeneratedTreeIsResolvable(dynamicDest);

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
  fs.writeFileSync(path.join(dynamicDest, 'vui.d.mts'), dts);

  let iconFontEntries: RawIconFontEntry[] = iconFont || [
    {
      src: '@mdi',
    },
  ];

  if (iconFontDefaults) {
    iconFontEntries = iconFontEntries.map((entry) => ({
      ...iconFontDefaults,
      ...entry,
    }));
  }

  plugins.push(
    ...dynamicSrcVitePlugin({
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

      if (config.ssr?.noExternal !== true) {
        config.ssr ??= {};
        config.ssr.noExternal ??= [];
        if (!Array.isArray(config.ssr.noExternal)) {
          config.ssr.noExternal = [config.ssr.noExternal as any];
        }
        config.ssr.noExternal.push(/\/vui\/dist\/builtins\//);
      }

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
