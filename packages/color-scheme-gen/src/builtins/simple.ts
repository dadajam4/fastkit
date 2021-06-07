import { createColorScheme } from '@fastkit/color-scheme';
import { COLOR_SCOPE_OPTIONAL_KEYS, scopeResolvers } from '../resolvers';

export function createSimpleColorScheme() {
  const scheme = createColorScheme({
    variants: ['contained', 'inverted', 'outlined', 'plain'],
    optionals: COLOR_SCOPE_OPTIONAL_KEYS,
    scopeResolvers: scopeResolvers({
      lightText: '#fff',
      darkText: 'rgba(0, 0, 0, 0.87)',
    }),
    themes: [
      {
        name: 'light',
        palette: [
          ['background', '#fff'],
          ['default', 'rgba(0, 0, 0, 0.87)'],
          ['link', '#1976d2'],
          ['caption', 'rgba(0, 0, 0, 0.87)'],
          ['backdrop', 'rgba(33, 33, 33, 0.46)'],
          ['primary', '#1976d2'],
          // ['secondary', '#424242'],
          ['secondary', 'rgb(220, 0, 78)'],
          ['gray', '#616161'],
          // ['accent', '#FFA726'],
          ['mono', '#323232'],
          ['info', 'rgb(33, 150, 243)'],
          ['success', 'rgb(76, 175, 80)'],
          ['warning', 'rgb(255, 152, 0)'],
          ['error', 'rgb(244, 67, 54)'],
          ['muted', 'rgba(0, 0, 0, 0.26)'],
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
              // light: ({ palette }) => palette('default').alpha(0.04),
              // deep: ({ palette }) => palette('default').alpha(0.1),
              outlineText: ({ palette }) => palette('default'),
            },
          ],
          ['primary', ({ palette }) => palette('primary')],
          ['secondary', ({ palette }) => palette('secondary')],
          ['gray', ({ palette }) => palette('gray')],
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
          // // ['secondary', '#424242'],
          ['secondary', 'rgb(244, 143, 177)'],
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
