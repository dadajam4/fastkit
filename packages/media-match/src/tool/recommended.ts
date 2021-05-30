import { createMediaMatchSettings } from '../schemes';

export interface RecommendedSettingsOptions {
  xxsMaxWidth?: number;
  xsMaxWidth?: number;
  smMaxWidth?: number;
  mdMaxWidth?: number;
}

export function createRecommendedSettings(
  opts: RecommendedSettingsOptions = {},
) {
  const {
    xxsMaxWidth = 320,
    xsMaxWidth = 575,
    smMaxWidth = 767,
    mdMaxWidth = 1023,
  } = opts;

  return createMediaMatchSettings({
    breakPoints: [
      {
        key: 'xs',
        max: xsMaxWidth,
        description: 'Phone (Narrow)',
      },
      {
        key: 'sm',
        max: smMaxWidth,
        description: 'Phone',
      },
      {
        key: 'md',
        max: mdMaxWidth,
        description: 'Console or Tablet',
      },
      {
        key: 'lg',
        min: mdMaxWidth + 1,
        description: 'Console (Wide)',
      },
    ],
    customs: [
      {
        key: 'xxs',
        condition: `(max-width:${xxsMaxWidth}px)`,
        description: 'Very narrow device',
      },
    ],
  }).setAlias({
    narrow: 'smAndDown',
    wide: 'mdAndUp',
  });
}
