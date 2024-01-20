import { defineComponent } from 'vue';
import {
  FormGroupControl,
  createFormGroupSettings,
  useFormGroup,
  FormNodeErrorSlotsSource,
} from '@fastkit/vue-form-control';
import { DefineSlotsType, defineSlots } from '@fastkit/vue-utils';
import { createControlProps, useControl } from '../../composables';
import { VUI_FORM_GROUP_SYMBOL } from '../../injections';

const { props, emits } = createFormGroupSettings();

export type VFormGroupSlots = DefineSlotsType<{
  default?: (form: FormGroupControl) => any;
}>;

export const formGroupSlots = defineSlots<
  VFormGroupSlots & FormNodeErrorSlotsSource
>();

export function createVFormGroupProps() {
  return {
    ...props,
    ...createControlProps(),
    ...formGroupSlots(),
  };
}

export const VFormGroup = defineComponent({
  name: 'VFormGroup',
  inheritAttrs: false,
  props: createVFormGroupProps(),
  emits,
  slots: formGroupSlots,
  // eslint-disable-next-line no-shadow
  setup(props, ctx) {
    const nodeControl = useFormGroup(props, ctx as any, {
      nodeType: VUI_FORM_GROUP_SYMBOL,
    });
    useControl(props);

    ctx.expose({
      control: nodeControl,
    });

    return () => ctx.slots.default?.(nodeControl);
  },
});
