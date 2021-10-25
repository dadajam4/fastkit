import './VControlField.scss';
import { computed, PropType, renderSlot, ref, defineComponent } from 'vue';
import {
  useParentFormNode,
  renderSlotOrEmpty,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  TypedSlot,
  createPropsOptions,
  defineSlotsProps,
} from '@fastkit/vue-kit';
import {
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
  useVuiColorProvider,
} from '../../composables';

const ADORNMENT_POSITIONS = ['start', 'end'] as const;

export type AdornmentPosition = typeof ADORNMENT_POSITIONS[number];

export function createControlFieldProps() {
  return {
    ...createPropsOptions({
      startAdornment: {} as PropType<VNodeChildOrSlot>,
      endAdornment: {} as PropType<VNodeChildOrSlot>,
      tabindex: {
        type: [String, Number],
        default: 0,
      },
    }),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
  };
}

// export const inputBoxSlots = {
//   default: () => true,
//   startAdornment: () => true,
//   endAdornment: () => true,
// };
export interface InputBoxSlots {
  default: void;
  startAdornment: void;
  endAdornment: void;
}

type ResolvedSlots = Partial<Record<AdornmentPosition, TypedSlot<void>>>;

export const VControlField = defineComponent({
  name: 'VControlField',
  props: {
    ...createControlFieldProps(),
    focused: Boolean,
    autoHeight: Boolean,
    ...defineSlotsProps<InputBoxSlots>(),
  },
  // _slots: inputBoxSlots,
  emits: {
    click: (ev: MouseEvent) => true,
  },
  setup(props, ctx) {
    const parentNode = useParentFormNode();
    const control = useControl(props);
    const inputBox = useControlField(props);
    const hostElRef = ref<HTMLElement | null>(null);

    const disabled = computed(() => !!parentNode && parentNode.isDisabled);
    const invalid = computed(() => !!parentNode && parentNode.invalid);
    const autoHeight = computed(() => props.autoHeight);
    const readonly = computed(() => !!parentNode && parentNode.isReadonly);
    // const computedTabindex = computed(() =>
    //   disabled.value ? -1 : props.tabindex,
    // );
    // const isOutlined = computed(() => inputBox.variant.value === 'outlined');
    const colorProvider = useVuiColorProvider();

    const classes = computed(() => {
      const classes = [
        'v-control-field',
        `v-control-field--${inputBox.variant.value}`,
        {
          'v-control-field--disabled': disabled.value,
          'v-control-field--invalid': invalid.value,
          'v-control-field--readonly': readonly.value,
          'v-control-field--focused': props.focused,
          'v-control-field--auto-height': autoHeight.value,
        },
        control.classes.value,
        colorProvider.className(
          invalid.value && !readonly.value ? 'error' : 'primary',
        ),
      ];
      return classes;
    });

    const resolvedSlots = computed(() => {
      const slots: ResolvedSlots = {};
      ADORNMENT_POSITIONS.forEach((position) => {
        const key = `${position}Adornment` as const;
        slots[position] = resolveVNodeChildOrSlots(props[key], ctx.slots[key]);
      });
      return slots;
    });

    const renderAdornment = (position: AdornmentPosition) => {
      const result = renderSlotOrEmpty(resolvedSlots.value, position);
      if (!result) return;
      return (
        <div
          class={[
            'v-control-field__adornment',
            `v-control-field__adornment--${position}`,
          ]}>
          {result}
        </div>
      );
    };

    const handleClick = (ev: MouseEvent) => {
      ctx.emit('click', ev);
      // if (ev.target === hostElRef.value) {
      //   ctx.emit('clickHost', ev);
      // }
    };

    return {
      classes,
      renderAdornment,
      hostElRef: () => hostElRef,
      handleClick,
      // computedTabindex,
    };
  },
  render() {
    return (
      <div
        class={this.classes}
        onClick={this.handleClick}
        // tabindex={this.computedTabindex}
        ref={this.hostElRef()}>
        {this.renderAdornment('start')}
        <div class="v-control-field__body">
          {renderSlot(this.$slots, 'default')}
        </div>
        {this.renderAdornment('end')}
      </div>
    );
  },
});
