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
