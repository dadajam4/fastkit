import './VOptionGroup.scss';
import { computed, PropType, defineComponent } from 'vue';
import {
  createFormSelectorItemGroupProps,
  useFormSelectorItemGroupControl,
  FormSelectorItemGroupControl,
} from '@fastkit/vue-form-control';
import {
  defineSlotsProps,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  renderSlotOrEmpty,
} from '@fastkit/vue-utils';
import { VUI_SELECT_SYMBOL } from '../../injections';

export const VOptionGroup = defineComponent({
  name: 'VOptionGroup',
  props: {
    ...createFormSelectorItemGroupProps(),
    // eslint-disable-next-line vue/require-prop-types
    label: {} as PropType<VNodeChildOrSlot<FormSelectorItemGroupControl>>,
    ...defineSlotsProps<{
      label: FormSelectorItemGroupControl;
    }>(),
  },
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
    return {
      ...groupControl.expose(),
      classes,
      labelSlot,
    };
  },
  render() {
    const { labelSlot, classes, groupControl } = this;
    const label = labelSlot ? labelSlot(groupControl) : undefined;
    return (
      <div class={classes}>
        {!!label && <div class="v-option-group__label">{label}</div>}
        {renderSlotOrEmpty(this.$slots, 'default')}
      </div>
    );
  },
});
