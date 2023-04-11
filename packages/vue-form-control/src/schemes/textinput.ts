import { nilToEmptyString, toHalfWidth, toSingleSpace } from '@fastkit/helpers';

export const TEXT_INPUT_TYPES = [
  'color',
  'date',
  'datetime-local',
  'email',
  'month',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'time',
  'url',
] as const;

export type TextInputType = (typeof TEXT_INPUT_TYPES)[number];

export type TextFinishingFn = (
  value?: string | null,
) => string | Promise<string>;

function defineFinishings<T extends string>(
  finishings: Record<T, TextFinishingFn>,
) {
  return finishings;
}

export const BUILTIN_TEXT_FINISHINGS = defineFinishings({
  trim: (v) => nilToEmptyString(v).trim(),
  removeSpace: (v) => nilToEmptyString(v).replace(/\s/g, ''),
  upper: (v) => nilToEmptyString(v).toUpperCase(),
  lower: (v) => nilToEmptyString(v).toLowerCase(),
  halfWidth: toHalfWidth,
  singleSpace: toSingleSpace,
  // kana: xxx,
});

export type BuiltinTextFinishingFnName = keyof typeof BUILTIN_TEXT_FINISHINGS;
