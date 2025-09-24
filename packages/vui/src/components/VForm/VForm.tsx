import { defineComponent, computed } from 'vue';
import {
  VueForm,
  createFormSettings,
  useForm,
} from '@fastkit/vue-form-control';
import { DefineSlotsType, defineSlots } from '@fastkit/vue-utils';
import { createControlProps, useControl } from '../../composables';
import { VUI_FORM_SYMBOL } from '../../injections';

const { props, emits } = createFormSettings({
  nodeType: VUI_FORM_SYMBOL,
});

export type VFormSlots = DefineSlotsType<{
  default?: (form: VueForm) => any;
}>;

export const formSlots = defineSlots<VFormSlots>();

export function createVFormProps() {
  return {
    ...props,
    ...createControlProps(),
    ...formSlots(),
  };
}

export const VForm = defineComponent({
  name: 'VForm',
  props: createVFormProps(),
  emits,
  slots: formSlots,
  setup(props, ctx) {
    const nodeControl = useForm(props, ctx as any, {
      nodeType: VUI_FORM_SYMBOL,
    });
    const classes = computed(() => [
      'v-form',
      {
        'v-form--valid': nodeControl.valid,
        'v-form--invalid': nodeControl.invalid,
        'v-form--disabled': nodeControl.isDisabled,
        'v-form--validating': nodeControl.validating,
        'v-form--pending': nodeControl.pending,
        'v-form--sending': nodeControl.sending,
      },
    ]);
    useControl(props);

    ctx.expose({
      control: nodeControl,
    });

    return () => (
      <form class={classes.value} {...nodeControl.formAttrs}>
        {ctx.slots.default?.(nodeControl)}
      </form>
    );
  },
});
