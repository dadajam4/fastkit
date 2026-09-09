import type { webfont } from 'webfont';
import path from 'node:path';
import { IconFontGenError } from './logger';

/**
 * Derived from webfont's public signature. webfont 12 added an `exports` map
 * that only publishes the package root, so its internal `dist` type paths are no
 * longer reachable. Tracking the upstream union means a format added there shows
 * up here as a missing key in {@link ICON_FONT_FORMAT_MAP}.
 */
export type IconFontFormat = NonNullable<
  NonNullable<Parameters<typeof webfont>[0]>['formats']
>[number];

/**
 * Every format this package knows how to emit, in the order they are written to
 * the `@font-face` `src` list. Only the formats actually requested through
 * `formats` are generated, so appending to this list does not change the output
 * of an existing configuration.
 */
export const ICON_FONT_FORMATS: IconFontFormat[] = [
  'eot',
  'woff',
  'woff2',
  'svg',
  'ttf',
  'otf',
];

export const ICON_FONT_FORMAT_MAP: Record<IconFontFormat, string> = {
  eot: 'embedded-opentype',
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  svg: 'svg',
  otf: 'opentype',
};

export interface IconFontSettings {
  fixedWidth?: boolean;
  centerHorizontally?: boolean;
  normalize?: boolean;
  fontHeight?: number;
  round?: number;
  descent?: number;
  disablePrefix?: boolean;
  absolutePath?: boolean;
  addHashInFontUrl?: boolean;
}

export interface IconFontEntry extends IconFontSettings {
  name: string;
  fontName: string;
  formats?: IconFontFormat[];
  startUnicode?: number;
  prefix: string;
  src: string;
  dest: string;
  display: 'block' | 'swap';
}

export interface RawIconFontEntry extends Omit<
  IconFontEntry,
  'name' | 'fontName' | 'prefix' | 'dest' | 'display'
> {
  name?: string;
  fontName?: string;
  /**
   * @default block
   */
  display?: 'block' | 'swap';
}

// export type RawIconFontOptions = IconFontEntry | IconFontEntry[];

/**
 * Module the generated code imports the icon-name registry from, and augments
 * with the names it generated.
 *
 * @see {@link IconFontOptions.runtimeModule}
 */
export const DEFAULT_ICON_FONT_RUNTIME_MODULE = '@fastkit/icon-font';

export interface IconFontOptions {
  entries: RawIconFontEntry[];
  dest: string;
  /**
   * Module the generated code imports `registerIconNames` / `IconName` from,
   * and whose `IconNameMap` it augments with the generated names.
   *
   * The generated files live in the *consuming* project, so this specifier is
   * resolved from there -- and pnpm places into a project's `node_modules` only
   * what the project itself declares, not what a peer declaration asks for. So
   * whatever this names becomes a package the project has to declare.
   *
   * Point it at a module the project already declares and that re-exports
   * `@fastkit/icon-font` -- a UI kit built on it, say -- and the project needs
   * nothing beyond that kit. Module augmentation follows a re-export to the
   * interface it aliases, so `IconNameMap` still merges into the one
   * `@fastkit/icon-font` declares, and every type derived from it agrees.
   *
   * @default '@fastkit/icon-font'
   */
  runtimeModule?: string;
}

/**
 * Removed source sentinel.
 *
 * `src: '@mdi'` used to mean "find `@mdi/svg`, and `pnpm add` it if it is not
 * there", then build a font from its SVGs. Installing a package as a side effect
 * of a build is a bad bargain wherever the build is not also the place
 * dependencies are managed: in a container image built with `--prod`, where that
 * devDependency was pruned, it failed with `ERR_PNPM_INCLUDED_DEPS_CONFLICT`
 * rather than anything a reader could act on.
 *
 * `@fastkit/vui` now ships a Material Design Icons webfont it generated at its
 * own build time, so nothing has to build one at a consumer's, and this package
 * has no reason to know that `@mdi/svg` exists. `src` is a directory of SVGs,
 * with no special cases.
 */
const REMOVED_MDI_SENTINEL = '@mdi';

export async function resolveRawIconFontEntry(
  rootDir: string,
  rawEntry: RawIconFontEntry,
): Promise<IconFontEntry> {
  const entry = {
    ...rawEntry,
  };

  if (entry.src === REMOVED_MDI_SENTINEL) {
    // Worth naming explicitly: left alone, `'@mdi'` is just a directory that
    // does not exist, and this generator skips an entry whose source is
    // missing -- so the failure mode is a silently empty font, not an error.
    throw new IconFontGenError(
      [
        `The \`src: '${REMOVED_MDI_SENTINEL}'\` sentinel has been removed.`,
        '',
        '`@fastkit/vui` ships a pre-generated Material Design Icons webfont, so a',
        'project using it needs no entry at all. Using this generator on its own,',
        'point `src` at a directory of SVG files -- for MDI, install `@mdi/svg`',
        'yourself and name its `svg` directory:',
        '',
        "  { src: './node_modules/@mdi/svg/svg', name: 'mdi', fontHeight: 512, descent: 64 }",
      ].join('\n'),
    );
  }

  const name = entry.name || path.basename(entry.src);
  const fontName = entry.fontName || `${name}-icon`;
  const dest = path.join(rootDir, name);
  const prefix = entry.disablePrefix ? '' : `${name}-`;
  const display = entry.display || 'block';
  return {
    ...entry,
    name,
    fontName,
    prefix,
    dest,
    display,
  };
}

export const DEFAULT_CONFIG_FILENAME = 'icon-font.config';

export const DEFAULT_DEST_DIRNAME = '.icon-font';

export interface IconFontConfig extends Omit<IconFontOptions, 'dest'> {
  dest?: string;
}

export function ceateIconFontConfig(options: IconFontConfig) {
  return options;
}
