import './VTextarea.scss';
import { defineComponent } from 'vue';
import {
  createTextareaSettings,
  useTextareaControl,
  createFormControlProps,
  FormControlSlots,
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
import { VUI_TEXTAREA_SYMBOL, useVui } from '../../injections';

const { props, emits } = createTextareaSettings();

export const VTextarea = defineComponent({
  name: 'VTextarea',
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
    const vui = useVui();
    const inputControl = useTextareaControl(props, ctx, {
      nodeType: VUI_TEXTAREA_SYMBOL,
      defaultRows: vui.textareaRows,
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
        class={['v-textarea', this.classes]}
        label={this.label}
        hint={this.hint}
        hinttip={this.hinttip}
        hiddenInfo={this.hiddenInfo}
        requiredChip={this.requiredChip}
        onClickLabel={(ev) => {
          this.focus();
        }}
        v-slots={{
          ...this.$slots,
          default: () => (
            <VControlField
              class="v-textarea__input"
              size={this.size}
              autoHeight
              startAdornment={this.startAdornment}
              endAdornment={this.endAdornment}
              // onClickHost={(ev) => {
              //   this.focus();
              // }}
              v-slots={{
                ...this.$slots,
                default: () =>
                  this.textareaControl.createInputElement({
                    class: 'v-textarea__input__element',
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
