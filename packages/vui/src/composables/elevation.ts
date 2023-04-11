import { PropType, ExtractPropTypes, computed } from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { VuiElevationValue } from '../schemes';

export function createElevationProps() {
  return createPropsOptions({
    elevation: Number as PropType<VuiElevationValue>,
  });
}

export type ElevationProps = ExtractPropTypes<
  ReturnType<typeof createElevationProps>
>;

export interface UseElevationOptions {
  defaultValue?: VuiElevationValue;
}

export function useElevation(
  props: ElevationProps,
  opts: UseElevationOptions = {},
) {
  const elevationValue = computed(() =>
    props.elevation == null ? opts.defaultValue : props.elevation,
  );
  const elevationClassName = computed(() => {
    const v = elevationValue.value;
    return v == null ? undefined : `elevation-${v}`;
  });
  return {
    elevationValue,
    elevationClassName,
  };
}
