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

// type ColorSchemeValueProp<T> = {
//   type: PropType<T>;
//   default: undefined;
// };

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
  : never) & // eslint-disable-line @typescript-eslint/ban-types
  (ScopeProp extends string
    ? {
        [K in ScopeProp]: PropType<ScopeName>;
      }
    : {}) & // eslint-disable-line @typescript-eslint/ban-types
  (TextColorProp extends string
    ? {
        [K in TextColorProp]: PropType<PaletteName>;
      }
    : never) & // eslint-disable-line @typescript-eslint/ban-types
  (BorderColorProp extends string
    ? {
        [K in BorderColorProp]: PropType<PaletteName>;
      }
    : never); // eslint-disable-line @typescript-eslint/ban-types

// export interface ColorSchemePropsStaticOptions {
//   defaultScope?: ScopeName;
//   defaultVariant?: ColorVariant;
// }

export interface ColorSchemePropsOptions<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> /*extends ColorSchemePropsStaticOptions*/ {
  theme?: ThemeProp;
  color?: ScopeProp;
  textColor?: TextColorProp;
  borderColor?: BorderColorProp;
}

export interface ColorSchemeHooksProps {
  readonly theme?: ThemeName | (() => ThemeName);
  readonly color?: ScopeName | (() => ScopeName);
  readonly textColor?: PaletteName | (() => PaletteName);
  readonly borderColor?: PaletteName | (() => PaletteName);
  readonly variant?: ColorVariant | (() => ColorVariant);
}

export interface ColorClassesResult {
  themeClass: ComputedRef<string | undefined>;
  scopeColorClass: ComputedRef<string | undefined>;
  textColorClass: ComputedRef<string | undefined>;
  borderColorClass: ComputedRef<string | undefined>;
  colorVariantClasses: ComputedRef<string[]>;
  colorClasses: ComputedRef<string[]>;
}

export type VueColorSchemeServiceSettings = ColorSchemeInfo<
  ThemeName,
  PaletteName,
  ScopeName,
  ColorVariant
>;
