export const CONTROL_SIZES = ['sm', 'md', 'lg'] as const;

export type ControlSize = typeof CONTROL_SIZES[number];

export const CONTROL_FIELD_VARIANTS = ['outlined', 'filled', 'flat'] as const;

export type ControlFieldVariant = typeof CONTROL_FIELD_VARIANTS[number];
