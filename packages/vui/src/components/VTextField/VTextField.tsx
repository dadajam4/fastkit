import './VTextField.scss';
import { defineComponent } from 'vue';
import {
  createTextInputSettings,
  useTextInputControl,
  createFormControlProps,
  FormControlSlots,
  defineSlotsProps,
} from '@fastkit/vue-kit';
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
import { VUI_TEXT_FIELD_SYMBOL } from '../../injections';

const { props, emits } = createTextInputSettings();

export const VTextField = defineComponent({
  name: 'VTextField',
  props: {
    ...props,
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<FormControlSlots & InputBoxSlots>(),
  },
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
        class={['v-text-field', this.classes]}
        label={this.label}
        hint={this.hint}
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
              onClickHost={(ev) => {
                this.focus();
              }}
              v-slots={{
                ...this.$slots,
                default: () =>
                  this.nodeControl.createInputElement({
                    class: 'v-text-field__input__element',
                  }),
              }}
            />
            // <div class="v-text-field__body">
            //   {/* {renderSlot(this.$slots, 'default')} */}
            //   {this.control.createElement({
            //     class: 'v-text-field__input',
            //   })}
            //   {/* {!!this.firstError && <p>{this.firstError.message}</p>} */}
            // </div>
          ),
        }}
      />
    );
  },
});