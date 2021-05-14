/* eslint-disable @typescript-eslint/ban-types */
import { PropType } from 'vue';

export * from './emits';
export * from './navigationable';

export const rawNumberPropType = [String, Number] as PropType<string | number>;

export type RawNumberProp<D extends number | string | undefined = undefined> =
  D extends undefined
    ? {
        type: PropType<string | number>;
        required: true;
      }
    : {
        type: PropType<string | number>;
        default: string | number;
      };

export function rawNumberProp<
  D extends number | string | undefined = undefined,
  R = RawNumberProp<D>,
>(defaultValue?: D): R {
  return {
    type: rawNumberPropType,
    required: defaultValue == null ? true : undefined,
    default: defaultValue,
  } as unknown as R;
}
