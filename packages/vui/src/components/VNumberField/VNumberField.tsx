import { defineComponent, PropType } from 'vue';
import {
  VTextField,
  TextFieldPropsOptions,
  TextFieldEmits,
} from '../VTextField/VTextField';

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

    return () => {
      return (
        <VTextField
          {...ctx.attrs}
          type="number"
          modelValue={toString(props.modelValue)}
          onUpdate:modelValue={(value) => {
            ctx.emit('update:modelValue', toNumber(value));
          }}
          onChange={(value) => {
            ctx.emit('change', toNumber(value));
          }}
          v-slots={ctx.slots}
        />
      );
    };
  },
});
