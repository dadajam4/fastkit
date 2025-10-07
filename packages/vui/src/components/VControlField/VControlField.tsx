import './VControlField.scss';
import { computed, PropType, ref, defineComponent, VNodeChild } from 'vue';
import { useParentFormNode } from '@fastkit/vue-form-control';
import {
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  TypedSlot,
  createPropsOptions,
  defineSlots,
  DefineSlotsType,
} from '@fastkit/vue-utils';
import { DISABLED_REASON_CONTAINER_BIND } from '@fastkit/vue-disabled-reason';
import {
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
} from '../../composables';
import { useVuiColorProvider } from '../../injections';
import { VProgressCircular } from '../loading';
import { CONTROL_LOADING_SPINNER_SIZES } from '../../schemes';

const ADORNMENT_POSITIONS = ['start', 'end'] as const;

export type AdornmentPosition = (typeof ADORNMENT_POSITIONS)[number];

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
export type InputBoxSlots = DefineSlotsType<{
  default?: () => any;
  startAdornment?: () => any;
  endAdornment?: () => any;
}>;

const slots = defineSlots<InputBoxSlots>();

type ResolvedSlots = Partial<Record<AdornmentPosition, TypedSlot<void>>>;

export const VControlField = defineComponent({
  name: 'VControlField',
  props: {
    ...createControlFieldProps(),
    focused: Boolean,
    autoHeight: Boolean,
    ...slots(),
    error: Boolean,
  },
  emits: {
    click: (ev: PointerEvent) => true,
  },
  slots,
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
      const _classes = [
        'v-control-field',
        `v-control-field--${inputBox.variant.value}`,
        {
          'v-control-field--disabled': disabled.value,
          'v-control-field--invalid': invalid.value || props.error,
          'v-control-field--readonly': readonly.value,
          'v-control-field--focused': props.focused,
          'v-control-field--auto-height': autoHeight.value,
        },
        control.classes.value,
        colorProvider.className(
          props.error
            ? 'error'
            : invalid.value && !readonly.value
              ? 'error'
              : 'primary',
        ),
      ];
      return _classes;
    });

    const resolvedSlots = computed(() => {
      const _slots: ResolvedSlots = {};
      ADORNMENT_POSITIONS.forEach((position) => {
        const key = `${position}Adornment` as const;
        _slots[position] = resolveVNodeChildOrSlots(props[key], ctx.slots[key]);
      });
      return _slots;
    });

    const renderAdornment = (position: AdornmentPosition) => {
      let child: VNodeChild | undefined;
      if (position === 'end' && props.loading) {
        child = (
          <VProgressCircular
            indeterminate
            size={CONTROL_LOADING_SPINNER_SIZES[props.size || 'md']}
          />
        );
      } else {
        child = resolvedSlots.value[position]?.();
      }
      if (!child) return;
      return (
        <div
          class={[
            'v-control-field__adornment',
            `v-control-field__adornment--${position}`,
          ]}>
          {child}
        </div>
      );
    };

    const handleClick = (ev: PointerEvent) => ctx.emit('click', ev);

    return () => (
      <div
        class={classes.value}
        onClick={handleClick}
        // tabindex={this.computedTabindex}
        ref={hostElRef}
        {...DISABLED_REASON_CONTAINER_BIND}>
        {renderAdornment('start')}
        <div class="v-control-field__body">{ctx.slots.default?.()}</div>
        {renderAdornment('end')}
      </div>
    );
  },
});
