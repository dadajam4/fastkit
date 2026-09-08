import type { webfont } from 'webfont';
import path from 'node:path';
import { installPackage } from '@fastkit/node-util';

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

export async function resolveRawIconFontEntry(
  rootDir: string,
  rawEntry: RawIconFontEntry,
): Promise<IconFontEntry> {
  const entry = {
    ...rawEntry,
  };

  // mdi support
  if (entry.src === '@mdi') {
    const installedDir = await findOrInstallMDI();
    entry.src = path.join(installedDir, 'svg');
    if (entry.fontHeight == null) {
      entry.fontHeight = 512;
    }
    if (entry.descent == null) {
      entry.descent = 64;
    }
    if (entry.name == null) {
      entry.name = 'mdi';
    }
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

function findOrInstallMDI() {
  return installPackage('@mdi/svg', { dev: true });
}

export const DEFAULT_CONFIG_FILENAME = 'icon-font.config';

export const DEFAULT_DEST_DIRNAME = '.icon-font';

export interface IconFontConfig extends Omit<IconFontOptions, 'dest'> {
  dest?: string;
}

export function ceateIconFontConfig(options: IconFontConfig) {
  return options;
}
