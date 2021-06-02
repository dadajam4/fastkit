import { Color, ColorSource } from '@fastkit/color';
import { Bucket } from './bucket';

export type ColorScopeOptionalKey<
  T extends string | readonly string[] = string,
> = T extends string ? T : T[number];

export interface ColorPaletteItemContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, OK>;
}

export type ColorPaletteItemResolver<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (ctx: ColorPaletteItemContext<TN, PN, SN, OK>) => ColorSource;

export type ColorPaletteItemSource<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = [PN, ColorSource | ColorPaletteItemResolver<TN, PN, SN, OK>];

export type ColorPaletteItemJSON<PN extends string = string> = {
  name: PN;
  value: string;
};

export interface ColorPaletteContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, OK>;
}

export interface ColorPaletteBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorPaletteItem<TN, PN, SN, OK>,
  C = ColorPaletteContext<TN, PN, SN, OK>,
  J = ColorPaletteItemJSON<PN>[],
> extends Bucket<PN, T, Color, C, J> {
  sources: ColorPaletteContext<TN, PN, SN, OK>[];
  ctx: C;
}

export type ColorPaletteItem<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly source: ColorPaletteItemSource<TN, PN, SN, OK>;
  readonly name: PN;
  readonly value: Color;
  readonly ctx: ColorPaletteItemContext<TN, PN, SN, OK>;
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, OK>;
  toJSON(): ColorPaletteItemJSON<PN>;
};

export interface ColorScopesContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, OK>;
}

export interface ColorScopesBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorScope<TN, PN, SN, OK>,
  C = ColorScopesContext<TN, PN, SN, OK>,
  J = ColorScopeJSON<SN, OK>[],
> extends Bucket<SN, T, T, C, J> {
  sources: ColorScopeSource<TN, PN, SN, OK>[];
  ctx: C;
}

export interface ColorScopeContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, OK>;
  readonly scopes: ColorScopesBucket<TN, PN, SN, OK>;
}

export type ColorScopeResolverResult = ColorSource | void | null | false;

export type ColorScopeResolver<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (
  ctx: ColorScopeContext<TN, PN, SN, OK> & ColorScope<TN, PN, SN, OK>,
) => ColorScopeResolverResult;

export type ColorScopeResolvers<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in OK]?: ColorScopeResolver<TN, PN, SN, OK> | null | false;
};

export type ColorScopeOptionalValueMap<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T extends ColorSource | ColorScopeResolver<TN, PN, SN, OK> =
    | ColorSource
    | ColorScopeResolver<TN, PN, SN, OK>,
> = {
  readonly [K in OK]?: T;
};

export type ColorScopeSource<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> =
  | [SN, ColorSource | ColorScopeResolver<TN, PN, SN, OK>]
  | [
      SN,
      ColorSource | ColorScopeResolver<TN, PN, SN, OK>,
      ColorScopeOptionalValueMap<
        TN,
        PN,
        SN,
        OK,
        ColorSource | ColorScopeResolver<TN, PN, SN, OK>
      >,
    ];

export type ColorScopeJSON<
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  name: SN;
  main: string;
} & {
  [K in OK]?: string;
};

export type ColorScopeOptionals<
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly [K in OK]?: Color;
};

export type ColorScope<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, OK>;
  readonly scopes: ColorScopesBucket<TN, PN, SN, OK>;
  readonly source: ColorScopeSource<TN, PN, SN, OK>;
  readonly ctx: ColorScopeContext<TN, PN, SN, OK>;
  readonly name: SN;
  readonly main: Color;
  readonly optionals: OK[];
  toJSON(): ColorScopeJSON<SN, OK>;
} & ColorScopeOptionals<OK>;

export type ColorScopeDefaultSource<
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T extends ColorSource = ColorSource,
> =
  | [T]
  | [
      T,
      {
        readonly [K in OK]?: T;
      },
    ];
export type ColorScopeDefaultJSON<
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  main: string;
} & {
  [K in OK]?: string;
};

export type ColorScopeDefault<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  theme: ColorTheme<TN, PN, SN, OK>;
  palette: ColorPaletteBucket<TN, PN, SN, OK>;
  defaults: ColorScopeDefaults<TN, PN, SN, OK>;
  main: Color;
  toJSON(): ColorScopeDefaultJSON<OK>;
} & {
  [K in OK]?: Color;
};

export type ColorScopeDefaultResolver<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (
  ctx: ColorScopeDefault<TN, PN, SN, OK>,
) => ColorScopeDefaultSource<OK> | null | false | void;

export type ColorScopeDefaultsResolver<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (ctx: {
  theme: ColorTheme<TN, PN, SN, OK>;
  palette: ColorPaletteBucket<TN, PN, SN, OK>;
}) => ColorScopeDefaultsSource<TN, PN, SN, OK> | null | false | void;

export const COLOR_SCOPE_DEFAULTS_KEYS = ['default', 'disabled'] as const;

export type ColorScopeDefaultsKey = typeof COLOR_SCOPE_DEFAULTS_KEYS[number];

export type ColorScopeDefaultsSource<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in ColorScopeDefaultsKey]?:
    | ColorScopeDefaultSource<OK>
    | ColorScopeDefaultResolver<TN, PN, SN, OK>;
};

export type ColorScopeDefaultsJSON<
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in ColorScopeDefaultsKey]?: ColorScopeDefaultJSON<OK>;
};

export type ColorScopeDefaults<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in ColorScopeDefaultsKey]?: ColorScopeDefault<TN, PN, SN, OK>;
} & {
  toJSON(): ColorScopeDefaultsJSON<OK>;
};

export interface ColorThemeSource<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly name: TN;
  readonly palette?: ColorPaletteItemSource<TN, PN, SN, OK>[];
  readonly scopes?: ColorScopeSource<TN, PN, SN, OK>[];
  readonly scopeDefaults?:
    | ColorScopeDefaultsSource<TN, PN, SN, OK>
    | ColorScopeDefaultsResolver<TN, PN, SN, OK>;
  readonly scopeResolvers?:
    | ColorScopeResolvers<TN, PN, SN, OK>
    | (() => ColorScopeResolvers<TN, PN, SN, OK>);
}

export type ColorThemeJSON<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  name: TN;
  palette: ColorPaletteItemJSON<PN>[];
  scopes: ColorScopeJSON<SN, OK>[];
  scopeDefaults?: ColorScopeDefaultsJSON<OK>;
};

export interface ColorThemeContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly themes: ColorThemeBucket<TN, PN, SN, OK>;
}

export type ColorTheme<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly source: ColorThemeSource<TN, PN, SN, OK>;
  readonly ctx: ColorThemeContext<TN, PN, SN, OK>;
  readonly name: TN;
  readonly palette: ColorPaletteBucket<TN, PN, SN, OK>;
  readonly scopes: ColorScopesBucket<TN, PN, SN, OK>;
  readonly scopeResolvers: ColorScopeResolvers<TN, PN, SN, OK>;
  readonly scopeDefaults?: ColorScopeDefaults<TN, PN, SN, OK>;
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
  readonly themes: ColorThemeBucket<TN, PN, SN, OK>;
  readonly optionals: OK[];
  toJSON(): ColorThemeJSON<TN, PN, SN, OK>;
};

export interface ColorThemesContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, OK>;
}

export interface ColorThemeBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorTheme<TN, PN, SN, OK>,
  C = ColorThemesContext<TN, PN, SN, OK>,
  J = ColorThemeJSON<TN, PN, SN, OK>[],
> extends Bucket<TN, T, T, C, J> {
  sources: ColorThemeSource<TN, PN, SN, OK>[];
  ctx: C;
}

export interface ColorSchemeSource<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly optionals?: readonly OK[];
  readonly scopeResolvers?:
    | ColorScopeResolvers<TN, PN, SN, OK>
    | (() => ColorScopeResolvers<TN, PN, SN, OK>);
  readonly themes: ColorThemeSource<TN, PN, SN, OK>[];
}

export interface ColorSchemeJSON<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  optionals?: OK[];
  themeNames: TN[];
  paletteNames: PN[];
  scopeNames: SN[];
  themes: ColorThemeJSON<TN, PN, SN, OK>[];
}

export interface ColorSchemeInfo<
  TN extends string,
  PN extends string,
  SN extends string,
> {
  readonly defaultTheme: TN;
  readonly themeNames: TN[];
  readonly paletteNames: PN[];
  readonly scopeNames: SN[];
}

export function colorSchemeInfoByScheme<
  TN extends string,
  PN extends string,
  SN extends string,
>(scheme: ColorScheme<TN, PN, SN, string>): ColorSchemeInfo<TN, PN, SN> {
  return scheme as any;
}

export interface ColorScheme<
  TN extends string,
  PN extends string,
  SN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> extends ColorSchemeInfo<TN, PN, SN> {
  readonly optionals: OK[];
  readonly source: ColorSchemeSource<TN, PN, SN, OK>;
  readonly themes: ColorThemeBucket<TN, PN, SN, OK>;
  readonly scopeResolvers: ColorScopeResolvers<TN, PN, SN, OK>;
  toJSON(): ColorSchemeJSON<TN, PN, SN, OK>;
}

export interface ThemeSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface
export interface PaletteSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface
export interface ScopeSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface

// eslint-disable-next-line @typescript-eslint/ban-types
type ExtractKeys<T extends object> = keyof T extends never ? string : keyof T;

export type ThemeName = ExtractKeys<ThemeSettings>;
export type PaletteName = ExtractKeys<PaletteSettings>;
export type ScopeName = ExtractKeys<ScopeSettings>;

export const COLOR_SCHEME_VARIANTS = [
  'contained',
  'outlined',
  'plain',
] as const;

export type ColorSchemeVariant = typeof COLOR_SCHEME_VARIANTS[number];
