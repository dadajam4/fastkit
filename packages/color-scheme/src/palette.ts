import { Color } from '@fastkit/color';
import { createBucket } from './utils';
import {
  ColorScopeOptionalKey,
  ColorPaletteItemContext,
  ColorPaletteItemSource,
  ColorPaletteItemJSON,
  ColorPaletteItem,
  ColorPaletteContext,
  ColorPaletteBucket,
} from './schemes';

export function createPaletteItem<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  source: ColorPaletteItemSource<TN, PN, SN, VN, OK>,
  ctx: ColorPaletteItemContext<TN, PN, SN, VN, OK>,
): ColorPaletteItem<TN, PN, SN, VN, OK> {
  const { scheme, theme, palette } = ctx;
  const name = source[0];
  let valueSource = source[1];

  if (typeof valueSource === 'function') {
    valueSource = valueSource(ctx);
  }

  const value = new Color(valueSource);

  const paletteItem: ColorPaletteItem<TN, PN, SN, VN, OK> = {
    get source() {
      return source;
    },
    get ctx() {
      return ctx;
    },
    get scheme() {
      return scheme;
    },
    get theme() {
      return theme;
    },
    get palette() {
      return palette;
    },
    get name() {
      return name;
    },
    get value() {
      return value.clone();
    },
    toJSON(): ColorPaletteItemJSON<PN> {
      return {
        name,
        value: value.toString(),
      };
    },
  };
  return paletteItem;
}

export function createColorPaletteBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  sources: ColorPaletteItemSource<TN, PN, SN, VN, OK>[] = [],
  ctx: ColorPaletteContext<TN, PN, SN, VN, OK>,
) {
  const palette = createBucket<
    PN,
    ColorPaletteItem<TN, PN, SN, VN, OK>,
    Color,
    ColorPaletteContext<TN, PN, SN, VN, OK>,
    ColorPaletteItemJSON<PN>[],
    ColorPaletteBucket<TN, PN, SN, VN, OK>
  >(
    'ColorPalette',
    (push, instance) => {
      sources.forEach((source) =>
        push(
          createPaletteItem(source, {
            ...ctx,
            palette: instance,
          }),
        ),
      );
    },
    ctx,
    (value) => {
      return value.value;
    },
    (values) => {
      return values.map((theme) => theme.toJSON());
    },
  );
  return palette;
}
