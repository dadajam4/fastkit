export const VAL_BAR_TYPES = ['systemBar', 'toolbar'] as const;

export type VueAppLayoutBarType = (typeof VAL_BAR_TYPES)[number];
