import { PropType } from 'vue';
import { MediaMatchKey } from '@fastkit/media-match';

export type RawGridValue<T extends number | string = number | string> =
  | T
  | Partial<Record<MediaMatchKey, T>>
  | undefined;

export type RawGridValueProp<T extends number | string = number | string> =
  PropType<RawGridValue<T>>;

export function extractRawGridValueClasses<
  T extends number | string = number | string,
>(
  value: NonNullable<RawGridValue<T>>,
  prefix: string,
  getter?: (value: T) => string,
): string | string[] {
  if (typeof value !== 'object')
    return `${prefix}${getter ? getter(value) : value}`;
  return Object.entries(value).map(([breakpoint, breakpointValue]) => {
    return `${prefix}${
      getter ? getter(breakpointValue) : breakpointValue
    }--${breakpoint}`;
  });
}

// export const DEFAULT_MEDIA_MATCH_KEY = MEDIA_MATCH_CONDITIONS[0].key;
