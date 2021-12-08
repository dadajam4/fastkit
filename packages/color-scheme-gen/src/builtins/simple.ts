import { createColorScheme } from '@fastkit/color-scheme';
import { COLOR_SCOPE_OPTIONAL_KEYS, scopeResolvers } from '../resolvers';
import { ColorSource, Color } from '@fastkit/color';

export interface SimpleColorSchemeOptions {
  background?: ColorSource;
  foundation?: ColorSource;
  default?: ColorSource;
  heading?: ColorSource;
  backdrop?: ColorSource;
  primary?: ColorSource;
  secondary?: ColorSource;
  accent?: ColorSource;
  success?: ColorSource;
  info?: ColorSource;
  warning?: ColorSource;
  error?: ColorSource;
  muted?: ColorSource;
}

export function createSimpleColorScheme(opts: SimpleColorSchemeOptions = {}) {
  const {
    background = '#fff',
    foundation = '#eef5f9',
    default: defaultPalette = '#607188',
    heading = '#516073',
    backdrop = 'rgba(131,151,172,.7)',
    primary = '#28bebd',
    secondary = '#222f3c',
    accent = '#ec407a',
    info = '#42a5f5',
    success = primary,
    warning = '#f8c200',
    error = '#f44336',
    muted = 'rgba(0, 0, 0, 0.38)',
  } = opts;
  const $background = new Color(background);
  const $foundation = new Color(foundation);
  const $default = new Color(defaultPalette);
  const $heading = new Color(heading);
  const $backdrop = new Color(backdrop);
  const $primary = new Color(primary);
  const $secondary = new Color(secondary);
  const $accent = new Color(accent);
  const $success = new Color(success);
  const $info = new Color(info);
  const $warning = new Color(warning);
  const $error = new Color(error);
  const $muted = new Color(muted);

  const scheme = createColorScheme({
    variants: ['contained', 'inverted', 'outlined', 'plain'],
    optionals: COLOR_SCOPE_OPTIONAL_KEYS,
    scopeResolvers: scopeResolvers({
      lightText: '#fff',
      darkText: 'rgba(0, 0, 0, 0.87)', // 2f495e
    }),
    themes: [
      {
        name: 'light',
        palette: [
          ['background', $background.hex()],
          ['foundation', $foundation.hex()],
          ['default', $default.hex()],
          ['heading', $heading.hex()],
          ['link', $primary.hex()],
          ['caption', $default.hex()],
          ['backdrop', $backdrop.hex()],
          ['primary', $primary.hex()],
          ['secondary', $secondary.hex()],
          ['accent', $accent.hex()],
          // ['gray', '#616161'],
          // ['accent', '#FFA726'],
          ['mono', '#323232'],
          ['info', $info.hex()],
          ['success', $success.hex()],
          ['warning', $warning.hex()],
          ['error', $error.hex()],
          ['muted', $muted.hex()],
        ],
        scopeDefaults: ({ palette, theme }) => {
          const disabledBase =
            theme.name === 'light' ? '0, 0, 0' : '255, 255, 255';

          return {
            default: [
              'transparent',
              {
                text: palette('default'),
                shadow: 'rgba(0, 0, 0, .3)',
                focusShadow: palette('default').alpha(0.3),
                // focus: palette('default').alpha(0.1),
                // active: palette('default').alpha(0.2),
                border: 'transparent',
              },
            ],
            disabled: [
              `rgba(${disabledBase}, 0.12)`,
              {
                light: 'transparent',
                deep: 'transparent',
                text: `rgba(${disabledBase}, 0.26)`,
                border: 'transparent',
                shadow: 'transparent',
                focus: `rgba(${disabledBase}, 0.12)`,
                focusBorder: 'transparent',
                focusShadow: 'transparent',
                active: `rgba(${disabledBase}, 0.12)`,
                activeBorder: 'transparent',
                outlineText: `rgba(${disabledBase}, 0.26)`,
                outlineBorder: `rgba(${disabledBase}, 0.12)`,
                invert: `rgba(${disabledBase}, 0.12)`,
                focusInvert: `rgba(${disabledBase}, 0.12)`,
                activeInvert: `rgba(${disabledBase}, 0.12)`,
              },
            ],
          };
        },
        scopes: [
          [
            'base',
            '#e0e0e0',
            // ({ palette }) => palette('background'),
            {
              // text: ({ palette }) => palette('default'),
              // focusShadow: ({ palette }) => palette('default').alpha(0.3),
              light: ({ palette }) => palette('default').alpha(0.06),
              deep: ({ palette }) => palette('default').alpha(0.12),
              outlineText: ({ palette }) => palette('default'),
            },
          ],
          ['primary', ({ palette }) => palette('primary')],
          [
            'secondary',
            ({ palette }) => palette('secondary'),
            {
              // #1c2732
              // deep: ({ palette }) => palette('secondary').darken(0.7),
              deep: '#1c2732',
              nav: '#91a6bb',
              navActive: '#fff',
              caption: new Color('#91a6bb').alpha(0.5),
              pin: '#ec407a',
            },
          ],
          ['accent', ({ palette }) => palette('accent')],
          // ['gray', ({ palette }) => palette('gray')],
          // ['accent', ({ palette }) => palette('accent')],
          ['mono', ({ palette }) => palette('mono')],
          // [
          //   'field',
          //   '#fff',
          //   {
          //     border: '#7a7a7a',
          //     // focusBorder: ({ palette }) => palette('primary'),
          //     // activeBorder: () => null,
          //     // focusShadow: ({ scopes }) => scopes('primary').focusShadow,
          //   },
          // ],
          ['info', ({ palette }) => palette('info')],
          ['success', ({ palette }) => palette('success')],
          ['warning', ({ palette }) => palette('warning')],
          ['error', ({ palette }) => palette('error')],
          ['muted', ({ palette }) => palette('muted')],
        ],
      },
      {
        name: 'dark',
        palette: [
          ['background', '#292a2d'],
          ['default', '#e1e1e1'],
          ['caption', '#a5a5a5'],
          ['mono', '#fff'],
          ['muted', 'rgba(255, 255, 255, 0.26)'],

          // ['link', '#1976d2'],
          // ['caption', 'rgba(0, 0, 0, 0.87)'],
          // ['backdrop', 'rgba(33, 33, 33, 0.46)'],
          ['primary', '#90caf9'],
          // ['gray', '#616161'],
          // // ['accent', '#82b1ff'],
          // ['info', 'rgb(33, 150, 243)'],
          // ['success', 'rgb(76, 175, 80)'],
          // ['warning', 'rgb(255, 152, 0)'],
          // ['error', 'rgb(244, 67, 54)'],
        ],
        // scopes: [
        //   [
        //     'muted',
        //     ({ palette }) => palette('muted'),
        //     { text: 'rgba(255, 255, 255, 0.12)' },
        //   ],
        // ],
      },
    ],
  });
  return scheme;
}

export default createSimpleColorScheme;
