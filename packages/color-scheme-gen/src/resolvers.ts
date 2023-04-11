import { ColorSource } from '@fastkit/color';
import { ColorScopeResolvers, ColorScopeResolver } from '@fastkit/color-scheme';

export const COLOR_SCOPE_OPTIONAL_KEYS = [
  'light',
  'deep',
  'text',
  'border',
  'shadow',
  'focus',
  'focusBorder',
  'focusText',
  'focusShadow',
  'active',
  'activeBorder',
  'activeText',
  'outlineText',
  'outlineBorder',
  'invert',
  'focusInvert',
  'activeInvert',
  'nav',
  'navActive',
  'caption',
  'pin',
  // 'disabled',
  // 'disabledBorder',
  // 'disabledText',
  // 'activeDisabled',
  // 'activeDisabledBorder',
  // 'activeDisabledText',
] as const;

type OK = (typeof COLOR_SCOPE_OPTIONAL_KEYS)[number];

type RecommendedResolvers = ColorScopeResolvers<string, string, string, OK>;

export function scopeResolvers(
  opts: {
    lightText?: ColorSource | ColorScopeResolver<string, string, string, OK>;
    darkText?: ColorSource | ColorScopeResolver<string, string, string, OK>;
    scopeInvertThreshold?: number;
    overrides?: RecommendedResolvers;
  } = {},
) {
  const {
    lightText = '#fff',
    darkText = '#000',
    scopeInvertThreshold = 0.6,
    overrides,
  } = opts;

  const resolvers: RecommendedResolvers = {
    light: ({ main }) => {
      return main.alpha(0.04);
    },
    deep: ({ main }) => {
      return main.alpha(0.1);
    },
    text: (ctx) => {
      const _lightText =
        typeof lightText === 'function' ? lightText(ctx) : lightText;
      const _darkText =
        typeof darkText === 'function' ? darkText(ctx) : darkText;
      const needInvert = ctx.main.brightness() >= scopeInvertThreshold;
      if (needInvert && _darkText) {
        return _darkText;
      } else if (!needInvert && _lightText) {
        return _lightText;
      }
      return false;
    },
    border: false,
    focus: ({ main }) => {
      return main.darken(0.07);
    },
    focusBorder: ({ border, palette }) => {
      return border ? border.darken(0.07) : false;
    },
    focusShadow: ({ main }) => {
      return main.mixAlpha(0, 0.5);
    },
    focusText: false,
    active: ({ main, focus }) => {
      return (focus || main).darken(0.07);
    },
    activeBorder: ({ border, focusBorder }) => {
      const _border = border || focusBorder;
      return _border ? _border.darken(0.07) : false;
    },
    activeText: false,
    outlineBorder: ({ main, outlineText }) => {
      const base = outlineText || main;
      return base.alpha(base.alpha() * 0.5);
    },
    invert: ({ theme }) => {
      return theme.isLight ? '#fff' : '#000';
    },
    focusInvert: ({ theme, invert, main }) => {
      if (invert) {
        return invert.mix(main, 0.05);
      }
      return theme.isLight ? '#fff' : '#000';
    },
    activeInvert: ({ theme, invert, focusInvert, main }) => {
      if (focusInvert) {
        return focusInvert.mix(main, 0.06);
      }
      if (invert) {
        return invert.mix(main, 0.03);
      }
      return theme.isLight ? '#fff' : '#000';
    },
    // disabled: false,
    // disabledBorder: false,
    // disabledText: false,
    // activeDisabled: false,
    // activeDisabledBorder: false,
    // activeDisabledText: false,
    ...overrides,
  };
  return resolvers as any;
}
