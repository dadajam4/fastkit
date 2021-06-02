import { PropType, ComputedRef } from 'vue';
import {
  ThemeName,
  PaletteName,
  ScopeName,
  ColorSchemeVariant,
  ColorSchemeInfo,
} from '@fastkit/color-scheme';
export type {
  ThemeName,
  PaletteName,
  ScopeName,
  ColorSchemeVariant,
} from '@fastkit/color-scheme';

export type PropKey = string | null | false | undefined;

type ColorSchemeValueProp<T> = {
  type: PropType<T | undefined>;
  default: undefined;
};

export type ColorSchemeProps<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> = {
  [K in ColorSchemeVariant]: BooleanConstructor;
} & {
  defaultVariant: PropType<ColorSchemeVariant>;
} & (ThemeProp extends string
    ? {
        [K in ThemeProp]: ColorSchemeValueProp<ThemeName>;
      }
    : never) & // eslint-disable-line @typescript-eslint/ban-types
  (ScopeProp extends string
    ? {
        [K in ScopeProp]: ColorSchemeValueProp<ScopeName>;
      }
    : {}) & // eslint-disable-line @typescript-eslint/ban-types
  (TextColorProp extends string
    ? {
        [K in TextColorProp]: ColorSchemeValueProp<PaletteName>;
      }
    : never) & // eslint-disable-line @typescript-eslint/ban-types
  (BorderColorProp extends string
    ? {
        [K in BorderColorProp]: ColorSchemeValueProp<PaletteName>;
      }
    : never); // eslint-disable-line @typescript-eslint/ban-types

export interface ColorSchemePropsStaticOptions {
  defaultScope?: ScopeName;
  defaultVariant?: ColorSchemeVariant | null | false;
}

export interface ColorSchemePropsOptions<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> extends ColorSchemePropsStaticOptions {
  theme?: ThemeProp;
  color?: ScopeProp;
  textColor?: TextColorProp;
  borderColor?: BorderColorProp;
}

export interface ColorSchemeHooksProps {
  readonly theme?: ThemeName;
  readonly color?: ScopeName;
  readonly textColor?: PaletteName;
  readonly borderColor?: PaletteName;
  readonly contained?: boolean;
  readonly outlined?: boolean;
  readonly plain?: boolean;
  readonly defaultVariant?: ColorSchemeVariant;
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
  ScopeName
>;
