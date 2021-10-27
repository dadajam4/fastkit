import { RunnerOptions } from 'fantasticon';
import type { SvgIcons2FontOptions } from 'svgicons2svgfont';
import path from 'path';

export type SvgOptions = Omit<
  SvgIcons2FontOptions,
  'fontName' | 'fontHeight' | 'descent' | 'normalize'
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IconFontEntry extends RunnerOptions {
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RawIconFontEntry extends Omit<RunnerOptions, 'outputDir'> {}

// export type RawIconFontOptions = IconFontEntry | IconFontEntry[];

export interface IconFontOptions {
  entries: RawIconFontEntry[];
  outputDir: string;
}

export function resolveRawIconFontEntry(
  rootDir: string,
  entry: RawIconFontEntry,
): IconFontEntry {
  const name =
    entry.name || entry.inputDir === '@mdi'
      ? 'mdi'
      : path.basename(entry.inputDir);
  const outputDir = path.join(rootDir, name);
  return {
    ...entry,
    name,
    outputDir,
  };
}
