import {
  GeneratedThemeName,
  GeneratedScopeName,
  GeneratedPaletteName,
} from '@fastkit/color-scheme';

export type ThemeName = GeneratedThemeName;

export type ScopeName = GeneratedScopeName;

export type PaletteName = GeneratedPaletteName;

export interface RawVueColorSchemePluginSettings {
  defaultTheme?: ThemeName;
  themeNames: readonly ThemeName[];
  scopeNames: readonly ScopeName[];
  paletteNames: readonly PaletteName[];
}

export interface VueColorSchemePluginSettings
  extends RawVueColorSchemePluginSettings {
  defaultTheme: ThemeName;
}

export type ColorSchemePropKey = string | null | false | undefined;

export const COLOR_SCHEME_VARIANTS = [
  'contained',
  'outlined',
  'plain',
] as const;

export type ColorSchemeVariant = typeof COLOR_SCHEME_VARIANTS[number];
