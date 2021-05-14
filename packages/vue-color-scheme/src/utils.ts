import { PropType } from 'vue';
import { ThemeName, ScopeName, PaletteName } from './types';

export type PropKey = string | null | false | undefined;

export type ColorSchemeProps<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
> = {
  // variant: PropType<ColorSchemeVariant>;
  contained: BooleanConstructor;
  outlined: BooleanConstructor;
  plain: BooleanConstructor;
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
  opts: {
    theme?: ThemeProp;
    color?: ScopeProp;
    textColor?: TextColorProp;
    borderColor?: BorderColorProp;
    defaultScope?: ScopeProp;
  } = {},
) {
  const {
    theme = 'theme',
    color = 'color',
    textColor = 'textColor',
    borderColor = 'borderColor',
    defaultScope,
  } = opts;
  const props = {
    contained: Boolean,
    outlined: Boolean,
    plain: Boolean,
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
