import './VOptionGroup.scss';
import { computed, PropType, defineComponent } from 'vue';
import {
  createFormSelectorItemGroupProps,
  useFormSelectorItemGroupControl,
  FormSelectorItemGroupControl,
} from '@fastkit/vue-form-control';
import {
  defineSlots,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
} from '@fastkit/vue-utils';
import { VUI_SELECT_SYMBOL } from '../../injections';

const slots = defineSlots<{
  label?: (control: FormSelectorItemGroupControl) => any;
  default?: () => any;
}>();

export const VOptionGroup = defineComponent({
  name: 'VOptionGroup',
  props: {
    ...createFormSelectorItemGroupProps(),
    // eslint-disable-next-line vue/require-prop-types
    label: {} as PropType<VNodeChildOrSlot<FormSelectorItemGroupControl>>,
    ...slots(),
  },
  slots,
  setup(props, ctx) {
    const groupControl = useFormSelectorItemGroupControl(props, ctx, {
      parentNodeType: VUI_SELECT_SYMBOL,
    });
    const labelSlot = computed(() => {
      return resolveVNodeChildOrSlots(props.label, ctx.slots.label);
    });
    const classes = computed(() => {
      return [
        'v-option-group',
        {
          'v-option-group--disabled': groupControl.isDisabled,
        },
      ];
    });

    ctx.expose({
      control: groupControl,
    });

    return () => {
      const label = labelSlot.value?.(groupControl);
      return (
        <div class={classes}>
          {!!label && <div class="v-option-group__label">{label}</div>}
          {ctx.slots.default?.()}
        </div>
      );
    };
  },
});
