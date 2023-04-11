import { Color, ColorSource } from '@fastkit/color';
import { Bucket } from './bucket';

export type ColorScopeOptionalKey<
  T extends string | readonly string[] = string,
> = T extends string ? T : T[number];

export interface ColorPaletteItemContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, VN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
}

export type ColorPaletteItemResolver<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (ctx: ColorPaletteItemContext<TN, PN, SN, VN, OK>) => ColorSource;

export type ColorPaletteItemSource<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = [PN, ColorSource | ColorPaletteItemResolver<TN, PN, SN, VN, OK>];

export type ColorPaletteItemJSON<PN extends string = string> = {
  name: PN;
  value: string;
};

export interface ColorPaletteContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, VN, OK>;
}

export interface ColorPaletteBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorPaletteItem<TN, PN, SN, VN, OK>,
  C = ColorPaletteContext<TN, PN, SN, VN, OK>,
  J = ColorPaletteItemJSON<PN>[],
> extends Bucket<PN, T, Color, C, J> {
  sources: ColorPaletteContext<TN, PN, SN, VN, OK>[];
  ctx: C;
}

export type ColorPaletteItem<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly source: ColorPaletteItemSource<TN, PN, SN, VN, OK>;
  readonly name: PN;
  readonly value: Color;
  readonly ctx: ColorPaletteItemContext<TN, PN, SN, VN, OK>;
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, VN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
  toJSON(): ColorPaletteItemJSON<PN>;
};

export interface ColorScopesContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, VN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
}

export interface ColorScopesBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorScope<TN, PN, SN, VN, OK>,
  C = ColorScopesContext<TN, PN, SN, VN, OK>,
  J = ColorScopeJSON<SN, OK>[],
> extends Bucket<SN, T, T, C, J> {
  sources: ColorScopeSource<TN, PN, SN, VN, OK>[];
  ctx: C;
}

export interface ColorScopeContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, VN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
  readonly scopes: ColorScopesBucket<TN, PN, SN, VN, OK>;
}

export type ColorScopeResolverResult = ColorSource | void | null | false;

export type ColorScopeResolver<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (
  ctx: ColorScopeContext<TN, PN, SN, VN, OK> & ColorScope<TN, PN, SN, VN, OK>,
) => ColorScopeResolverResult;

export type ColorScopeResolvers<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in OK]?: ColorScopeResolver<TN, PN, SN, VN, OK> | null | false;
};

export type ColorScopeOptionalValueMap<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T extends ColorSource | ColorScopeResolver<TN, PN, SN, VN, OK> =
    | ColorSource
    | ColorScopeResolver<TN, PN, SN, VN, OK>,
> = {
  readonly [K in OK]?: T;
};

export type ColorScopeSource<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> =
  | [SN, ColorSource | ColorScopeResolver<TN, PN, SN, VN, OK>]
  | [
      SN,
      ColorSource | ColorScopeResolver<TN, PN, SN, VN, OK>,
      ColorScopeOptionalValueMap<
        TN,
        PN,
        SN,
        VN,
        OK,
        ColorSource | ColorScopeResolver<TN, PN, SN, VN, OK>
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
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly theme: ColorTheme<TN, PN, SN, VN, OK>;
  readonly palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
  readonly scopes: ColorScopesBucket<TN, PN, SN, VN, OK>;
  readonly source: ColorScopeSource<TN, PN, SN, VN, OK>;
  readonly ctx: ColorScopeContext<TN, PN, SN, VN, OK>;
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
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  theme: ColorTheme<TN, PN, SN, VN, OK>;
  palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
  defaults: ColorScopeDefaults<TN, PN, SN, VN, OK>;
  main: Color;
  toJSON(): ColorScopeDefaultJSON<OK>;
} & {
  [K in OK]?: Color;
};

export type ColorScopeDefaultResolver<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (
  ctx: ColorScopeDefault<TN, PN, SN, VN, OK>,
) => ColorScopeDefaultSource<OK> | null | false | void;

export type ColorScopeDefaultsResolver<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = (ctx: {
  theme: ColorTheme<TN, PN, SN, VN, OK>;
  palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
}) => ColorScopeDefaultsSource<TN, PN, SN, VN, OK> | null | false | void;

export const COLOR_SCOPE_DEFAULTS_KEYS = ['default', 'disabled'] as const;

export type ColorScopeDefaultsKey = (typeof COLOR_SCOPE_DEFAULTS_KEYS)[number];

export type ColorScopeDefaultsSource<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in ColorScopeDefaultsKey]?:
    | ColorScopeDefaultSource<OK>
    | ColorScopeDefaultResolver<TN, PN, SN, VN, OK>;
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
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  [K in ColorScopeDefaultsKey]?: ColorScopeDefault<TN, PN, SN, VN, OK>;
} & {
  toJSON(): ColorScopeDefaultsJSON<OK>;
};

export interface ColorThemeSource<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly name: TN;
  readonly palette?: ColorPaletteItemSource<TN, PN, SN, VN, OK>[];
  readonly scopes?: ColorScopeSource<TN, PN, SN, VN, OK>[];
  readonly scopeDefaults?:
    | ColorScopeDefaultsSource<TN, PN, SN, VN, OK>
    | ColorScopeDefaultsResolver<TN, PN, SN, VN, OK>;
  readonly scopeResolvers?:
    | ColorScopeResolvers<TN, PN, SN, VN, OK>
    | (() => ColorScopeResolvers<TN, PN, SN, VN, OK>);
}

export type ColorThemeJSON<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
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
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly themes: ColorThemeBucket<TN, PN, SN, VN, OK>;
}

export type ColorTheme<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> = {
  readonly source: ColorThemeSource<TN, PN, SN, VN, OK>;
  readonly ctx: ColorThemeContext<TN, PN, SN, VN, OK>;
  readonly name: TN;
  readonly palette: ColorPaletteBucket<TN, PN, SN, VN, OK>;
  readonly scopes: ColorScopesBucket<TN, PN, SN, VN, OK>;
  readonly scopeResolvers: ColorScopeResolvers<TN, PN, SN, VN, OK>;
  readonly scopeDefaults?: ColorScopeDefaults<TN, PN, SN, VN, OK>;
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
  readonly themes: ColorThemeBucket<TN, PN, SN, VN, OK>;
  readonly optionals: OK[];
  readonly isLight: boolean;
  readonly isDark: boolean;
  toJSON(): ColorThemeJSON<TN, PN, SN, VN, OK>;
};

export interface ColorThemesContext<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly scheme: ColorScheme<TN, PN, SN, VN, OK>;
}

export interface ColorThemeBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
  T = ColorTheme<TN, PN, SN, VN, OK>,
  C = ColorThemesContext<TN, PN, SN, VN, OK>,
  J = ColorThemeJSON<TN, PN, SN, VN, OK>[],
> extends Bucket<TN, T, T, C, J> {
  sources: ColorThemeSource<TN, PN, SN, VN, OK>[];
  ctx: C;
}

export const BULTIN_COLOR_VARIANTS = [
  'contained',
  'outlined',
  'inverted',
  'plain',
] as const;

export type BultinColorVariant = (typeof BULTIN_COLOR_VARIANTS)[number];

export interface ColorVariantSource<VN extends string> {
  readonly name: VN;
  from?: BultinColorVariant;
  scss?:
    | string
    | Promise<string>
    | ((scope: TemplateScope) => string | Promise<string>);
}

export type RawColorVariantSource<VN extends string> =
  | VN
  | ColorVariantSource<VN>;

export interface ColorSchemeSource<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  readonly variants?: readonly RawColorVariantSource<VN>[];
  readonly optionals?: readonly OK[];
  readonly scopeResolvers?:
    | ColorScopeResolvers<TN, PN, SN, VN, OK>
    | (() => ColorScopeResolvers<TN, PN, SN, VN, OK>);
  readonly themes: ColorThemeSource<TN, PN, SN, VN, OK>[];
}

export interface ColorSchemeJSON<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> {
  optionals?: OK[];
  themeNames: TN[];
  paletteNames: PN[];
  scopeNames: SN[];
  variants: VN[];
  themes: ColorThemeJSON<TN, PN, SN, VN, OK>[];
}

export interface ColorSchemeInfo<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
> {
  readonly defaultTheme: TN;
  readonly themeNames: TN[];
  readonly paletteNames: PN[];
  readonly scopeNames: SN[];
  readonly variants: VN[];
}

export function colorSchemeInfoByScheme<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
>(
  scheme: ColorScheme<TN, PN, SN, VN, string>,
): ColorSchemeInfo<TN, PN, SN, VN> {
  return scheme as any;
}

export interface ColorScheme<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
> extends ColorSchemeInfo<TN, PN, SN, VN> {
  readonly variantSources: ColorVariantSource<VN>[];
  readonly optionals: OK[];
  readonly source: ColorSchemeSource<TN, PN, SN, VN, OK>;
  readonly themes: ColorThemeBucket<TN, PN, SN, VN, OK>;
  readonly scopeResolvers: ColorScopeResolvers<TN, PN, SN, VN, OK>;
  toJSON(): ColorSchemeJSON<TN, PN, SN, VN, OK>;
}

export interface ThemeSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface
export interface PaletteSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface
export interface ScopeSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface
export interface ColorVariantSettings {} // eslint-disable-line @typescript-eslint/no-empty-interface

// eslint-disable-next-line @typescript-eslint/ban-types
type ExtractKeys<T extends object, D> = keyof T extends never ? D : keyof T;

export type ThemeName = ExtractKeys<ThemeSettings, '__ThemeName__'>;
export type PaletteName = ExtractKeys<PaletteSettings, '__PaletteName__'>;
export type ScopeName = ExtractKeys<ScopeSettings, '__ScopeName__'>;
export type ColorVariant = ExtractKeys<
  ColorVariantSettings,
  '__ColorVariant__'
>;

export interface TemplateScope {
  scheme: ColorScheme<any, any, any, any>;
  scssValues: string;
  list(source: string[], divider?: string): string;
  builtinVariantScss(
    variant: BultinColorVariant,
    selector?: string,
  ): Promise<string>;
  variantScss(variant: string): Promise<string>;
  allVariantsScss(): Promise<string>;
}
