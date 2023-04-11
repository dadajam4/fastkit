import {
  createGlobalThemeContract,
  createGlobalTheme,
  globalStyle,
} from '@vanilla-extract/css';
import { mediaMatches } from '../../.vui/media-match/media-match';

export const vars = createGlobalThemeContract({
  fonts: {
    brand: 'docs-theme-font',
  },
  layout: {
    container: {
      width: 'docs-container-width',
      padding: 'v-app-container-padding',
    },
  },
});

createGlobalTheme(':root', vars, {
  fonts: {
    brand: `'Zen Dots', sans-serif`,
  },
  layout: {
    container: {
      width: '960px',
      padding: '16px',
    },
  },
});

globalStyle(':root', {
  '@media': {
    [mediaMatches.condition.md]: {
      vars: {
        '--v-app-container-padding': '32px',
      },
    },
    [mediaMatches.condition.lg]: {
      vars: {
        '--v-app-container-padding': '40px',
      },
    },
  },
});
