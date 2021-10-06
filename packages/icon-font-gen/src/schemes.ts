import { RunnerOptions } from 'fantasticon';
import type { SvgIcons2FontOptions } from 'svgicons2svgfont';

export type SvgOptions = Omit<
  SvgIcons2FontOptions,
  'fontName' | 'fontHeight' | 'descent' | 'normalize'
>;

export type IconFontEntry = RunnerOptions;

export type RawIconFontOptions = IconFontEntry | IconFontEntry[];

export type IconFontOptions = IconFontEntry[];
