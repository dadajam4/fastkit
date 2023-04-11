import {
  PropType,
  ExtractPropTypes,
  computed,
  ComputedRef,
  provide,
  inject,
} from 'vue';
import {
  ControlSize,
  CONTROL_SIZES,
  ControlFieldVariant,
  CONTROL_FIELD_VARIANTS,
} from '../schemes';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  VuiControlInjectionKey,
  VuiControlFieldInjectionKey,
} from '../injections';

export function createControlProps() {
  return createPropsOptions({
    size: {
      type: String as PropType<ControlSize>,
      validator: (value: any) => {
        if (value == null) return true;
        return CONTROL_SIZES.includes(value);
      },
    },
    loading: Boolean,
  });
}

export type ControlProps = ExtractPropTypes<
  ReturnType<typeof createControlProps>
>;

export interface ControlProvider {
  parentControl: ControlProvider | null;
  size: ComputedRef<ControlSize>;
  classes: ComputedRef<any>;
}

export interface UseControlProviderOptions {
  defaultSize?: ControlSize;
}

export function useControl(
  props: ControlProps,
  opts: UseControlProviderOptions = {},
) {
  const { defaultSize = 'md' } = opts;
  const parentControl = inject(VuiControlInjectionKey, null);
  const size = computed(() => {
    const psize = props.size;
    return psize
      ? psize
      : parentControl
      ? parentControl.size.value
      : defaultSize;
  });
  const classes = computed(() => {
    return ['v-control', `v-control--${size.value}`];
  });
  const provider: ControlProvider = {
    parentControl,
    size,
    classes,
  };
  provide(VuiControlInjectionKey, provider);
  return provider;
}

export function createControlFieldProviderProps() {
  return createPropsOptions({
    variant: {
      type: String as PropType<ControlFieldVariant>,
      validator: (value: any) => {
        if (value == null) return true;
        return CONTROL_FIELD_VARIANTS.includes(value);
      },
    },
  });
}

export type ControlFieldProviderProps = ExtractPropTypes<
  ReturnType<typeof createControlFieldProviderProps>
>;

export interface ControlFieldProvider {
  parentControlField: ControlFieldProvider | null;
  variant: ComputedRef<ControlFieldVariant>;
}

export interface UseControlFieldProviderOptions {
  defaultVariant?: ControlFieldVariant;
}

export function useControlField(
  props: ControlFieldProviderProps,
  opts: UseControlFieldProviderOptions = {},
) {
  const { defaultVariant = 'flat' } = opts;
  const parentControlField = inject(VuiControlFieldInjectionKey, null);
  const variant = computed(() => {
    const pvariant = props.variant;
    return pvariant
      ? pvariant
      : parentControlField
      ? parentControlField.variant.value
      : defaultVariant;
  });
  const provider: ControlFieldProvider = {
    parentControlField,
    variant,
  };
  provide(VuiControlFieldInjectionKey, provider);
  return provider;
}
