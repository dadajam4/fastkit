import { ColorSchemeInfo } from '@fastkit/color-scheme';

export const THEME_NAMES = Object.freeze(['light', 'dark'] as const);
export type ColorThemeName = 'light' | 'dark';

export const PALETTE_NAMES = Object.freeze(['background', 'default', 'link', 'caption', 'backdrop', 'primary', 'secondary', 'gray', 'mono', 'info', 'success', 'warning', 'error', 'muted'] as const);
export type ColorPaletteName = 'background' | 'default' | 'link' | 'caption' | 'backdrop' | 'primary' | 'secondary' | 'gray' | 'mono' | 'info' | 'success' | 'warning' | 'error' | 'muted';

export const SCOPE_NAMES = Object.freeze(['base', 'primary', 'secondary', 'gray', 'mono', 'info', 'success', 'warning', 'error', 'muted'] as const);
export type ColorScopeName = 'base' | 'primary' | 'secondary' | 'gray' | 'mono' | 'info' | 'success' | 'warning' | 'error' | 'muted';

export const DEFAULT_THEME: ColorThemeName = 'light';

export const colorScheme: ColorSchemeInfo<ColorThemeName, ColorPaletteName, ColorScopeName> = Object.freeze({
  defaultTheme: DEFAULT_THEME,
  themeNames: THEME_NAMES,
  paletteNames: PALETTE_NAMES,
  scopeNames: SCOPE_NAMES,
});

export default colorScheme;

declare module '@fastkit/color-scheme' {
  export type GeneratedThemeName = ColorThemeName;

  export type GeneratedScopeName = ColorScopeName;

  export type GeneratedPaletteName = ColorPaletteName;
}
