/* eslint-disable */
import { ColorSchemeInfo } from '@fastkit/color-scheme';

export interface ThemeSettings {
  light: true;
  dark: true;
}

export interface PaletteSettings {
  background: true;
  default: true;
  link: true;
  caption: true;
  backdrop: true;
  primary: true;
  secondary: true;
  gray: true;
  mono: true;
  info: true;
  success: true;
  warning: true;
  error: true;
  muted: true;
}

export interface ScopeSettings {
  base: true;
  primary: true;
  secondary: true;
  gray: true;
  mono: true;
  info: true;
  success: true;
  warning: true;
  error: true;
  muted: true;
}

export type ThemeName = keyof ThemeSettings;
export type PaletteName = keyof PaletteSettings;
export type ScopeName = keyof ScopeSettings;

declare module '@fastkit/color-scheme' {
  export interface ThemeSettings {
      light: true;
      dark: true;
    }

  export interface PaletteSettings {
      background: true;
      default: true;
      link: true;
      caption: true;
      backdrop: true;
      primary: true;
      secondary: true;
      gray: true;
      mono: true;
      info: true;
      success: true;
      warning: true;
      error: true;
      muted: true;
    }

  export interface ScopeSettings {
      base: true;
      primary: true;
      secondary: true;
      gray: true;
      mono: true;
      info: true;
      success: true;
      warning: true;
      error: true;
      muted: true;
    }
}

export type ColorScheme = ColorSchemeInfo<ThemeName, PaletteName, ScopeName>;

export const colorScheme: ColorScheme = {
  defaultTheme: 'light',
  themeNames: ['light', 'dark'],
  paletteNames: ['background', 'default', 'link', 'caption', 'backdrop', 'primary', 'secondary', 'gray', 'mono', 'info', 'success', 'warning', 'error', 'muted'],
  scopeNames: ['base', 'primary', 'secondary', 'gray', 'mono', 'info', 'success', 'warning', 'error', 'muted'],
};

export default colorScheme;
