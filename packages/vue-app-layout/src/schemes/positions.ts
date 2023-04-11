export const VAL_X_POSITIONS = ['left', 'right'] as const;

export type VueAppLayoutPositionX = (typeof VAL_X_POSITIONS)[number];

export const VAL_Y_POSITIONS = ['top', 'bottom'] as const;

export type VueAppLayoutPositionY = (typeof VAL_Y_POSITIONS)[number];

export const VAL_POSITIONS = [...VAL_X_POSITIONS, ...VAL_Y_POSITIONS];

export const VAL_STICK_Y_POSITIONS = [
  'window',
  'systemBar',
  'toolbar',
] as const;

export type VueAppLayoutStickPositionY = (typeof VAL_STICK_Y_POSITIONS)[number];

export const VAL_STICK_X_POSITIONS = [
  'window',
  'drawer',
  'staticDrawer',
] as const;

export type VueAppLayoutStickPositionX = (typeof VAL_STICK_X_POSITIONS)[number];

export const VAL_DRAWER_DEFAULT_POSITION = 'left';

export const VAL_STACK_DEFAULT_POSITION_X = 'window';

export const VAL_STACK_DEFAULT_POSITION_Y = 'window';

export const VAL_BAR_DEFAULT_POSITION = 'top';
