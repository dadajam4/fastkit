import type { OptionsBase } from 'webfont/dist/src/types/OptionsBase';
import path from 'node:path';
import { installPackage } from '@fastkit/node-util';

export type IconFontFormat = NonNullable<OptionsBase['formats']>[number];

export const ICON_FONT_FORMATS: IconFontFormat[] = [
  'eot',
  'woff',
  'woff2',
  'svg',
  'ttf',
];

export const ICON_FONT_FORMAT_MAP: Record<IconFontFormat, string> = {
  eot: 'embedded-opentype',
  woff2: 'woff2',
  woff: 'woff',
  ttf: 'truetype',
  svg: 'svg',
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
}

export interface RawIconFontEntry
  extends Omit<IconFontEntry, 'name' | 'fontName' | 'prefix' | 'dest'> {
  name?: string;
  fontName?: string;
}

// export type RawIconFontOptions = IconFontEntry | IconFontEntry[];

export interface IconFontOptions {
  entries: RawIconFontEntry[];
  dest: string;
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
  return {
    ...entry,
    name,
    fontName,
    prefix,
    dest,
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
