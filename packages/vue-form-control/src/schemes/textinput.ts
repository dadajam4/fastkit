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

export const TEXT_INPUT_MODES = [
  'decimal',
  'email',
  'none',
  'numeric',
  'search',
  'tel',
  'text',
  'url',
] as const;

export type TextInputMode = (typeof TEXT_INPUT_MODES)[number];

export type TextFinalizer = (value?: string | null) => string | Promise<string>;

function defineFinalizers<T extends string>(
  finalizers: Record<T, TextFinalizer>,
) {
  return finalizers;
}

export const BUILTIN_TEXT_FINALIZERS = defineFinalizers({
  trim: (v) => nilToEmptyString(v).trim(),
  removeSpace: (v) => nilToEmptyString(v).replace(/\s/g, ''),
  upper: (v) => nilToEmptyString(v).toUpperCase(),
  lower: (v) => nilToEmptyString(v).toLowerCase(),
  halfWidth: toHalfWidth,
  singleSpace: toSingleSpace,
  // kana: xxx,
});

export type BuiltinTextFinalizerName = keyof typeof BUILTIN_TEXT_FINALIZERS;
