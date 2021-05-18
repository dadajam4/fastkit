import { PropType } from 'vue';
import { ThemeName, ScopeName, PaletteName, ColorSchemeVariant } from './types';

export type PropKey = string | null | false | undefined;

// export const COLOR_SCHEME_VARIANTS = [
//   'contained',
//   'outlined',
//   'plain',
// ] as const;

// export type ColorSchemeVariant = typeof COLOR_SCHEME_VARIANTS[number];

export type ColorSchemeProps<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> = {
  [K in ColorSchemeVariant]: BooleanConstructor;
  // variant: PropType<ColorSchemeVariant>;
  // contained: BooleanConstructor;
  // outlined: BooleanConstructor;
  // plain: BooleanConstructor;
} & {
  defaultVariant: PropType<ColorSchemeVariant>;
} & (ThemeProp extends string
    ? { [K in ThemeProp]: PropType<ThemeName> }
    : {}) & // eslint-disable-line @typescript-eslint/ban-types
  (ScopeProp extends string ? { [K in ScopeProp]: PropType<ScopeName> } : {}) & // eslint-disable-line @typescript-eslint/ban-types
  (TextColorProp extends string
    ? { [K in TextColorProp]: PropType<PaletteName> }
    : {}) & // eslint-disable-line @typescript-eslint/ban-types
  (BorderColorProp extends string
    ? { [K in BorderColorProp]: PropType<PaletteName> }
    : {}); // eslint-disable-line @typescript-eslint/ban-types

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

export function colorSchemeProps<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
  Props = ColorSchemeProps<
    ThemeProp,
    ScopeProp,
    TextColorProp,
    BorderColorProp
  >,
>(
  opts: ColorSchemePropsOptions<
    ThemeProp,
    ScopeProp,
    TextColorProp,
    BorderColorProp
  > = {},
) {
  const {
    theme = 'theme',
    color = 'color',
    textColor = 'textColor',
    borderColor = 'borderColor',
    defaultScope,
    defaultVariant,
  } = opts;
  const props = {
    contained: Boolean,
    outlined: Boolean,
    plain: Boolean,
    defaultVariant: {
      type: String,
      default: defaultVariant || undefined,
    },
  } as unknown as Props;
  if (theme) (props as any)[theme] = String;
  if (color)
    (props as any)[color] = {
      type: String,
      default: defaultScope,
    };
  if (textColor) (props as any)[textColor] = String;
  if (borderColor) (props as any)[borderColor] = String;
  return props;
}
