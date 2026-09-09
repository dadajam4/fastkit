import { Plugin } from 'vite';
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit';
import path from 'node:path';
import fs from 'fs-extra';
import { RawIconFontEntry, IconFontSettings } from '@fastkit/icon-font-gen';
import { VuiServiceOptions } from '@fastkit/vui';
// The `IconNameMap` augmentation for the webfont `@fastkit/vui` ships, so the
// default `icons` below are checked against the real names instead of being
// cast past `IconName`'s placeholder. Type-only: nothing is imported at runtime,
// and a project generating its own font (`iconFont`) is unaffected -- it never
// imports this module, so its own names remain the whole of `IconName`.
import type {} from '@fastkit/vui/icon-font/index.mjs';
import { Eta } from 'eta';
import module from 'node:module';
import { VitePluginVuiError } from './logger';
import pkg from '../package.json';

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
<%~ it.iconFont %>
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

/**
 * Turn a generated file's path into an import specifier for `installer.ts`.
 *
 * Every generated module lives inside `dest`, the same directory `installer.ts`
 * is written to, so the installer can always reach them relatively. Emitting the
 * absolute path instead baked the generating machine's layout into a file
 * projects do commit -- `/Users/someone/...` resolves nowhere on anyone else's
 * checkout -- and on Windows produced a specifier full of backslashes.
 *
 * `ViteVuiPluginResult.settings` keeps the absolute paths: those are for
 * programmatic use, not for embedding in emitted code.
 */
function toInstallerSpecifier(dest: string, target: string) {
  const relative = path.relative(dest, target).split(path.sep).join('/');
  return relative.startsWith('.') ? relative : `./${relative}`;
}

/**
 * How `installer.ts` pulls in the icon webfonts.
 *
 * The font `@fastkit/vui` ships is always loaded: this kit's own defaults are
 * named in it -- `menuDown: 'mdi-menu-down'`, `clear: 'mdi-close'`, twenty-odd
 * more -- so a project that dropped it would have to redefine every one of them
 * before anything rendered. Its module is imported, not just its stylesheet,
 * because that module also carries the `IconNameMap` augmentation for those
 * names; importing it puts the declaration in the project's program.
 *
 * The specifiers reach into `dist` through vui's `"./*"` export -- the same way
 * `@fastkit/vui/builtins/color-scheme.ts` and `@fastkit/vui/after-effects.scss`
 * are reached -- because plugboy rebuilds the `exports` map from the workspace
 * entries on every build and a hand-written key would not survive.
 */
const SHIPPED_ICON_FONT_IMPORTS = [
  `import '@fastkit/vui/icon-font/index.css';`,
  `import '@fastkit/vui/icon-font/index.mjs';`,
];

/**
 * Anything `iconFont` asked for, loaded *in addition* to the shipped font.
 *
 * Both augment `IconNameMap`, so `IconName` ends up the union of the two and
 * matches what is actually loaded at runtime.
 */
const GENERATED_ICON_FONT_IMPORT = `import './icon-font';`;

function renderIconFontImports(generatesIconFont: boolean) {
  return [
    ...SHIPPED_ICON_FONT_IMPORTS,
    ...(generatesIconFont ? [GENERATED_ICON_FONT_IMPORT] : []),
    // Eta trims the newline that follows an interpolation tag, so the value has
    // to carry its own or the next import runs onto the same line.
    '',
  ].join('\n');
}

async function renderTemplate(
  { colorScheme, mediaMatch, uiSettings, icons }: ViteVuiPluginResultSettings,
  dest: string,
  generatesIconFont: boolean,
) {
  const eta = new Eta();
  const result = await eta.renderStringAsync(TEMPLATE, {
    colorScheme: toInstallerSpecifier(dest, colorScheme),
    mediaMatch: toInstallerSpecifier(dest, mediaMatch),
    uiSettings: JSON.stringify(uiSettings),
    icons: JSON.stringify(icons),
    iconFont: renderIconFontImports(generatesIconFont),
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
 * Name of the file recording what produced the generated tree.
 *
 * Dot-prefixed to sit alongside the generators' own `.hash` meta files rather
 * than looking like something the project wrote.
 */
const MANIFEST_NAME = '.manifest.json';

/**
 * Packages whose version decides what the generated tree looks like.
 *
 * `@fastkit/vite-kit` and the three generators are resolved through vite-kit
 * rather than from here: under pnpm a package's dependencies sit beside *it*,
 * not beside its dependents, so `@fastkit/color-scheme-gen` does not resolve
 * from this package's directory at all. vite-kit does, being a direct
 * dependency, and the generators are its own.
 */
const GENERATOR_PACKAGES = [
  '@fastkit/icon-font-gen',
  '@fastkit/color-scheme-gen',
  '@fastkit/media-match-gen',
];

interface GeneratedTreeManifest {
  /** Bumped when the manifest's own shape changes, to force one rebuild. */
  manifest: number;
  generators: Record<string, string | undefined>;
  runtimeModule: string;
  /** Directory names under `icon-font/`, so a removed entry leaves nothing behind. */
  iconFonts: string[];
}

function readVersion(from: NodeRequire, name: string): string | undefined {
  try {
    return fs.readJsonSync(from.resolve(`${name}/package.json`)).version;
  } catch {
    return undefined;
  }
}

function collectGeneratorVersions(): Record<string, string | undefined> {
  const versions: Record<string, string | undefined> = {
    '@fastkit/vite-plugin-vui': pkg.version,
    '@fastkit/vite-kit': readVersion(require, '@fastkit/vite-kit'),
  };
  let fromViteKit: NodeRequire | undefined;
  try {
    fromViteKit = module.createRequire(
      require.resolve('@fastkit/vite-kit/package.json'),
    );
  } catch {
    fromViteKit = undefined;
  }
  for (const name of GENERATOR_PACKAGES) {
    versions[name] = fromViteKit ? readVersion(fromViteKit, name) : undefined;
  }
  return versions;
}

/**
 * Discard a generated tree that a different toolchain produced.
 *
 * Only `@fastkit/icon-font-gen` skips work when nothing changed, and it decides
 * that from its own version and options alone (#191). Nothing accounted for a
 * change in this package, in `@fastkit/vite-kit`, or in what the generators are
 * asked to emit -- and nothing removed output that is no longer generated at
 * all, such as `icon-font/<name>/` for an entry that has since been dropped:
 * the watch-mode runner only ever adds. Projects worked around both by deleting
 * the directory by hand whenever a `@fastkit/*` version moved.
 *
 * So record what produced the tree, and empty it when that no longer matches.
 * The manifest is written only after generation succeeds, so a failed run
 * leaves no claim and the next one starts clean again.
 */
function resetGeneratedTreeOnToolchainChange(
  dynamicDest: string,
  manifest: GeneratedTreeManifest,
): void {
  const manifestPath = path.join(dynamicDest, MANIFEST_NAME);
  // The manifest is built with a fixed key order, so comparing the serialized
  // form is enough and keeps this free of a deep-equal dependency.
  const previous = fs.existsSync(manifestPath)
    ? fs.readFileSync(manifestPath, 'utf-8')
    : undefined;
  if (previous === JSON.stringify(manifest, null, 2)) return;
  fs.emptyDirSync(dynamicDest);
}

/**
 * The single module the generated tree imports from and augments.
 *
 * Each generator defaults to its own leaf package (`@fastkit/icon-font`,
 * `@fastkit/color-scheme`, `@fastkit/media-match`), which is right for using
 * them standalone. Here they are pointed at `@fastkit/vui` instead: it
 * re-exports all three, and a project using this plugin declares it by
 * definition, so the generated tree resolves without the project having to
 * declare the leaves as well. Module augmentation follows a re-export to the
 * interface it aliases, so the augmentations still land on the leaves' own
 * declarations and every derived type agrees.
 */
const RUNTIME_MODULE = '@fastkit/vui';

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
 * generator and `vite build` both succeed while the generated tree's imports
 * resolve nothing.
 *
 * Kept to what {@link RUNTIME_MODULE} does not cover: the icon-font,
 * color-scheme and media-match packages are reached through `@fastkit/vui`, so
 * they are not listed here.
 */
const GENERATED_TREE_IMPORTS = [
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
    ].join('\n'),
  );
}

export interface ViteVuiPluginOptions extends Partial<
  Pick<VuiServiceOptions, 'uiSettings' | 'icons'>
> {
  dynamicDest?: string;
  colorScheme?: string;
  mediaMatch?: string;
  /**
   * Additional icon webfonts to generate for this project, from your own SVGs.
   *
   * These are generated *in addition to* the Material Design Icons webfont
   * `@fastkit/vui` ships, not instead of it -- this is the slot for adding your
   * own icons to the kit. `IconName` becomes the union of both, which is exactly
   * what is loaded at runtime.
   *
   * Leave it unset -- the common case -- and nothing is generated at all, so the
   * project needs no `@fastkit/icon-font-gen`.
   *
   * ```ts
   * viteVuiPlugin({ iconFont: [{ src: './assets/icons' }] });
   * ```
   */
  iconFont?: RawIconFontEntry[];
  /**
   * Font-generation settings merged into every {@link iconFont} entry.
   *
   * These are metrics for fonts generated *here*. The shipped MDI font is built
   * once, by `@fastkit/vui`, with fixed metrics, so with no `iconFont` entries
   * there is nothing for them to apply to.
   */
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
      menuDown: 'mdi-menu-down',
      navigationExpand: 'mdi-menu-down',
      prev: 'mdi-chevron-left',
      next: 'mdi-chevron-right',
      sort: 'mdi-chevron-down',
      editorTextColor: 'mdi-format-color-text',
      editorformatBold: 'mdi-format-bold',
      editorformatUnderline: 'mdi-format-underline',
      editorformatItalic: 'mdi-format-italic',
      editorformatListBulleted: 'mdi-format-list-bulleted',
      editorformatListNumbered: 'mdi-format-list-numbered',
      editorAlignLeft: 'mdi-format-align-left',
      editorAlignCenter: 'mdi-format-align-center',
      editorAlignRight: 'mdi-format-align-right',
      editorAlignJustify: 'mdi-format-align-justify',
      editorLink: 'mdi-link',
      editorLinkOff: 'mdi-link-off',
      editorUndo: 'mdi-undo-variant',
      editorRedo: 'mdi-redo-variant',
      hinttip: 'mdi-help-circle-outline',
      clear: 'mdi-close',
      reload: 'mdi-reload',
      fileUpload: 'mdi-file-upload',
      // navigationExpand: (gen, active) => {
      //   return gen({
      //     name: 'mdi-menu-down',
      //     rotate: active ? 180 : 0,
      //   });
      // },
      ...options.icons,
    },
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

  // The default used to be `[{ src: '@mdi' }]`, which made every project on the
  // stock configuration obtain `@mdi/svg` (7,447 SVGs, ~31MB) and generate a
  // 1.7MB tree from it at build time -- and `@fastkit/icon-font-gen` would run
  // `pnpm add @mdi/svg` to get there, which fails outright in a `--prod` image
  // where the devDependency was pruned. `@fastkit/vui` ships that font now and
  // is the only package that knows `@mdi/svg` exists, so there is no default
  // entry: what is listed here is what a project adds on top.
  let iconFontEntries: RawIconFontEntry[] = iconFont || [];

  if (iconFontDefaults) {
    iconFontEntries = iconFontEntries.map((entry) => ({
      ...iconFontDefaults,
      ...entry,
    }));
  }

  const generatesIconFont = iconFontEntries.length > 0;

  // Only the generated tree is referenced here. The shipped font's
  // `IconNameMap` augmentation reaches the project through `installer.ts`'s
  // import of `@fastkit/vui/icon-font/index.mjs`, so both apply and `IconName`
  // is the union of the two.
  const dts = [
    '/// <reference path="./color-scheme/color-scheme.info.ts" />',
    ...(generatesIconFont
      ? ['/// <reference path="./icon-font/index.ts" />']
      : []),
    '/// <reference path="./media-match/media-match.ts" />',
    'export {};',
  ].join('\n');

  const manifest: GeneratedTreeManifest = {
    manifest: 1,
    generators: collectGeneratorVersions(),
    runtimeModule: RUNTIME_MODULE,
    // `resolveRawIconFontEntry` derives the same name, from `src` when none is
    // given. Absolute paths stay out, so the manifest does not differ between a
    // developer's machine and CI.
    iconFonts: iconFontEntries
      .map(({ name, src }) => name || path.basename(src))
      .sort(),
  };

  resetGeneratedTreeOnToolchainChange(dynamicDest, manifest);

  fs.ensureDirSync(dynamicDest);
  fs.writeFileSync(path.join(dynamicDest, 'setup.scss'), COLOR_DUMP_STYLE);
  // `vui.d.ts`, not `.d.mts`: this file exists to be named in a project's
  // `compilerOptions.types` (`["./.vui/vui"]`), and that lookup only considers
  // `.d.ts`. It carries nothing but `/// <reference path>` lines pointing at the
  // generated declarations, so it has to be reachable for their `declare module`
  // augmentations to apply at all.
  fs.writeFileSync(path.join(dynamicDest, 'vui.d.ts'), dts);

  plugins.push(
    ...dynamicSrcVitePlugin({
      colorScheme: {
        src: colorSchemeSrc,
        dest: colorSchemeDest,
        runtimeModule: RUNTIME_MODULE,
      },
      mediaMatch: {
        src: path.resolve(mediaMatch),
        dest: mediaMatchDest,
        runtimeModule: RUNTIME_MODULE,
      },
      iconFont: generatesIconFont
        ? {
            entries: iconFontEntries,
            dest: path.join(dynamicDest, 'icon-font'),
            runtimeModule: RUNTIME_MODULE,
          }
        : undefined,
      // The manifest is written here, not in this plugin's own `config` hook:
      // that hook is `enforce: 'pre'`, so it runs *before* the generators. This
      // fires once they have all booted, which is the only point where the tree
      // on disk is known to match what the manifest claims. A failed run
      // therefore leaves the directory it emptied without a manifest, and the
      // next one regenerates from scratch.
      onBooted: async () => {
        await fs.writeFile(
          path.join(dynamicDest, MANIFEST_NAME),
          JSON.stringify(manifest, null, 2),
        );
        await onBooted?.();
      },
      onBootError,
    }),
  );

  const plugin: Plugin = {
    name: 'vite:vui',
    enforce: 'pre',
    async config(config) {
      await fs.writeFile(
        path.join(dynamicDest, 'installer.ts'),
        await renderTemplate(settings, dynamicDest, generatesIconFont),
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
