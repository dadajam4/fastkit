import { createMediaMatchSettings } from './schemes';

export interface RecommendedSettingsOptions {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export function createRecommendedSettings(
  opts: RecommendedSettingsOptions = {},
) {
  const {
    // sm = 320,
    // md = 600,
    // lg = 900,
    // xl = 1200
    sm = 600,
    md = 900,
    lg = 1025,
    xl = 1200,
  } = opts;

  return createMediaMatchSettings({
    breakpoints: [
      {
        key: 'xs',
        min: 0,
        description: 'Phone',
      },
      {
        key: 'sm',
        min: sm,
        description: 'Tablet',
      },
      {
        key: 'md',
        min: md,
        description: 'Tablet and Narrow Console',
      },
      {
        key: 'lg',
        min: lg,
        description: 'Console',
      },
      {
        key: 'xl',
        min: xl,
        description: 'Wide Console',
      },
    ],
    customs: [
      {
        key: 'xxs',
        condition: `all and (max-width: 320px)`,
        description: 'Very narrow device',
      },
      {
        key: 'print',
        condition: `print`,
        description: 'Printing',
      },
    ],
  });
}
