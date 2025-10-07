import './VTextField.scss';
import { defineComponent, computed } from 'vue';
import {
  createTextInputNodeSettings,
  useTextInputNodeControl,
  createFormNodeWrapperProps,
  FormNodeWrapperSlots,
  TextInputNodeEmits,
} from '@fastkit/vue-form-control';
import { defineSlots, ExtractPropInput, withCtx } from '@fastkit/vue-utils';
import { VFormControl } from '../VFormControl';
import {
  VControlField,
  createControlFieldProps,
  InputBoxSlots,
} from '../VControlField';
import {
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
} from '../../composables';
import { VTextCounter } from '../VTextCounter';
import { VUI_TEXT_FIELD_SYMBOL } from '../../injections';

const { props, emits } = createTextInputNodeSettings();

const slots = defineSlots<FormNodeWrapperSlots & InputBoxSlots>();

function createTextFieldProps() {
  return {
    ...props,
    ...createFormNodeWrapperProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...slots(),
  };
}

export type TextFieldPropsOptions = ReturnType<typeof createTextFieldProps>;

export type TextFieldEmits = TextInputNodeEmits;

export type TextFieldInput = ExtractPropInput<
  ReturnType<typeof createTextFieldProps>
>;

export const VTextField = defineComponent({
  name: 'VTextField',
  props: createTextFieldProps(),
  emits,
  slots,
  setup(props, ctx) {
    const inputControl = useTextInputNodeControl(props, ctx, {
      nodeType: VUI_TEXT_FIELD_SYMBOL,
    });
    const control = useControl(props);
    useControlField(props);

    const classes = computed(() => ['v-text-field', control.classes.value]);

    const handleClickLabel = (ev: PointerEvent) => {
      inputControl.focus();
    };

    const defaultSlot = () => (
      <VControlField
        class="v-text-field__input"
        startAdornment={props.startAdornment}
        endAdornment={props.endAdornment}
        size={control.size.value}
        v-slots={{
          ...ctx.slots,
          default: withCtx(() => [
            inputControl.createInputElement({
              class: 'v-text-field__input__element',
            }),
            inputControl.createDatalist(),
          ]),
        }}
      />
    );

    const infoAppendsSlot = () => {
      const { counterResult } = inputControl;
      if (!counterResult) return;
      return <VTextCounter {...counterResult} />;
    };

    ctx.expose({
      control: inputControl,
    });

    return () => (
      <VFormControl
        nodeControl={inputControl}
        // focused={inputControl.focused}
        hiddenInfo={props.hiddenInfo}
        class={classes.value}
        label={props.label}
        hint={props.hint}
        hinttip={props.hinttip}
        requiredChip={props.requiredChip}
        onClickLabel={handleClickLabel}
        v-slots={{
          ...ctx.slots,
          default: withCtx(defaultSlot),
          infoAppends: withCtx(infoAppendsSlot),
        }}
      />
    );
  },
});
