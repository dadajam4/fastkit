import { defineComponent, PropType, computed } from 'vue';
import {
  VTextField,
  TextFieldPropsOptions,
  TextFieldInput,
  TextFieldEmits,
} from '../VTextField/VTextField';

const toString = (value?: string | number | null): string => {
  if (value == null) return '';
  return String(value);
};

const toNumber = (value?: string | number | null): number | null => {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  if (value.trim() === '') return null;
  return Number(value);
};

export const VNumberField = defineComponent({
  name: 'VNumberField',
  props: {
    ...(undefined as unknown as Omit<TextFieldPropsOptions, 'type'>),
    modelValue: {
      type: Number as PropType<number | null>,
      default: null,
    },
  },
  emits: {
    ...(undefined as unknown as Omit<
      TextFieldEmits,
      'update:modelValue' | 'change'
    >),
    'update:modelValue': (value: number | null) => true,
    change: (value: number | null) => true,
  },
  setup(props, ctx) {
    const hasNumberMask = computed(() => {
      const { mask } = ctx.attrs as TextFieldInput;
      return (
        !!mask && typeof mask === 'object' && (mask as any).mask === Number
      );
    });

    const inputmode = computed<TextFieldInput['inputmode']>(() => {
      // eslint-disable-next-line no-shadow
      const { inputmode } = ctx.attrs as TextFieldInput;
      if (inputmode) return inputmode;
      return hasNumberMask.value ? 'decimal' : undefined;
    });

    const onUpdateModelValue = (value: string) => {
      ctx.emit('update:modelValue', toNumber(value));
    };

    const onChange = (value: string) => {
      ctx.emit('change', toNumber(value));
    };

    return () => (
      <VTextField
        {...ctx.attrs}
        type={hasNumberMask.value ? 'text' : 'number'}
        inputmode={inputmode.value}
        maskModel="typed"
        modelValue={toString(props.modelValue)}
        onUpdate:modelValue={onUpdateModelValue}
        onChange={onChange}
        v-slots={ctx.slots as any}
      />
    );
  },
});
