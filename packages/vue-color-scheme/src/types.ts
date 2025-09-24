import { PropType, ComputedRef } from 'vue';
import {
  ThemeName,
  PaletteName,
  ScopeName,
  ColorVariant,
  ColorSchemeInfo,
} from '@fastkit/color-scheme';

export type {
  ThemeName,
  PaletteName,
  ScopeName,
  ColorVariant,
} from '@fastkit/color-scheme';

export type PropKey = string | null | false | undefined;

export type ColorSchemeProps<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> = {
  variant: PropType<ColorVariant>;
} & (ThemeProp extends string
  ? {
      [K in ThemeProp]: PropType<ThemeName>;
    }
  : never) &
  (ScopeProp extends string
    ? {
        [K in ScopeProp]: PropType<ScopeName>;
      }
    : {}) &
  (TextColorProp extends string
    ? {
        [K in TextColorProp]: PropType<PaletteName>;
      }
    : never) &
  (BorderColorProp extends string
    ? {
        [K in BorderColorProp]: PropType<PaletteName>;
      }
    : never);

// export interface ColorSchemePropsStaticOptions {
//   defaultScope?: ScopeName;
//   defaultVariant?: ColorVariant;
// }

export interface ColorSchemePropsOptions<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> /* extends ColorSchemePropsStaticOptions */ {
  theme?: ThemeProp;
  color?: ScopeProp;
  textColor?: TextColorProp;
  borderColor?: BorderColorProp;
}

export interface ColorSchemeHooksProps {
  readonly theme?: ThemeName | (() => ThemeName | undefined);
  readonly color?: ScopeName | (() => ScopeName | undefined);
  readonly textColor?: PaletteName | (() => PaletteName | undefined);
  readonly borderColor?: PaletteName | (() => PaletteName | undefined);
  readonly variant?: ColorVariant | (() => ColorVariant | undefined);
}

export interface ColorClassesResult {
  // theme?: ThemeName;
  // color?: ScopeName;
  // variant?: ColorVariant;
  theme: ComputedRef<{
    value?: ThemeName;
    classes?: string;
  }>;
  color: ComputedRef<{
    value?: ScopeName;
    classes?: string;
  }>;
  textColor: ComputedRef<{
    value?: PaletteName;
    classes?: string;
  }>;
  borderColor: ComputedRef<{
    value?: PaletteName;
    classes?: string;
  }>;
  variant: ComputedRef<{
    value?: ColorVariant;
    classes?: string;
  }>;
  // themeClass: ComputedRef<string | undefined>;
  // scopeColorClass: ComputedRef<string | undefined>;
  // textColorClass: ComputedRef<string | undefined>;
  // borderColorClass: ComputedRef<string | undefined>;
  // colorVariantClasses: ComputedRef<string[]>;
  colorClasses: ComputedRef<string[]>;
}

export type VueColorSchemeServiceSettings = ColorSchemeInfo<
  ThemeName,
  PaletteName,
  ScopeName,
  ColorVariant
>;
