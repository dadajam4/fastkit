import './VTextField.scss';
import { defineComponent } from 'vue';
import {
  createTextInputSettings,
  useTextInputControl,
  createFormControlProps,
  FormControlSlots,
  TextInputEmits,
} from '@fastkit/vue-form-control';
import { defineSlotsProps } from '@fastkit/vue-utils';
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
import { ExtractPropInput } from '@fastkit/vue-utils';

const { props, emits } = createTextInputSettings();

function createTextFieldProps() {
  return {
    ...props,
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<FormControlSlots & InputBoxSlots>(),
  };
}

export type TextFieldPropsOptions = ReturnType<typeof createTextFieldProps>;

export type TextFieldEmits = TextInputEmits;

export type TextFieldInput = ExtractPropInput<
  ReturnType<typeof createTextFieldProps>
>;

export const VTextField = defineComponent({
  name: 'VTextField',
  props: createTextFieldProps(),
  emits,
  setup(props, ctx) {
    const inputControl = useTextInputControl(props, ctx, {
      nodeType: VUI_TEXT_FIELD_SYMBOL,
    });
    const control = useControl(props);
    useControlField(props);

    return {
      ...inputControl.expose(),
      ...control,
    };
  },
  render() {
    return (
      <VFormControl
        nodeControl={this.nodeControl}
        focused={this.nodeControl.focused}
        hiddenInfo={this.hiddenInfo}
        class={['v-text-field', this.classes]}
        label={this.label}
        hint={this.hint}
        hinttip={this.hinttip}
        requiredChip={this.requiredChip}
        onClickLabel={(ev) => {
          this.focus();
        }}
        v-slots={{
          ...this.$slots,
          default: () => (
            <VControlField
              class="v-text-field__input"
              startAdornment={this.startAdornment}
              endAdornment={this.endAdornment}
              size={this.size}
              v-slots={{
                ...this.$slots,
                default: () =>
                  this.textInputControl.createInputElement({
                    class: 'v-text-field__input__element',
                  }),
              }}
            />
          ),
          infoAppends: () => {
            const { counterResult } = this;
            if (!counterResult) return;
            return <VTextCounter {...counterResult} />;
          },
        }}
      />
    );
  },
});
