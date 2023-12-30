import './VTextarea.scss';
import { defineComponent } from 'vue';
import {
  createTextareaNodeSettings,
  useTextareaNodeControl,
  createFormControlProps,
  FormControlSlots,
} from '@fastkit/vue-form-control';
import { defineSlots } from '@fastkit/vue-utils';
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

const { props, emits } = createTextareaNodeSettings();

const slots = defineSlots<FormControlSlots & InputBoxSlots>();

export const VTextarea = defineComponent({
  name: 'VTextarea',
  props: {
    ...props,
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...slots(),
  },
  emits,
  setup(props, ctx) {
    const vui = useVui();
    const inputControl = useTextareaNodeControl(props, ctx, {
      nodeType: VUI_TEXTAREA_SYMBOL,
      defaultRows: vui.textareaRows,
    });
    const control = useControl(props);
    useControlField(props);

    ctx.expose({
      control: inputControl,
    });

    const defaultSlot = () => {
      return (
        <VControlField
          class="v-textarea__input"
          size={control.size.value}
          autoHeight
          startAdornment={props.startAdornment}
          endAdornment={props.endAdornment}
          // onClickHost={(ev) => {
          //   this.focus();
          // }}
          v-slots={{
            ...ctx.slots,
            default: () =>
              inputControl.createInputElement({
                class: 'v-textarea__input__element',
              }),
          }}
        />
      );
    };

    const infoAppendsSlot = () => {
      const { counterResult } = inputControl;
      if (!counterResult) return;
      return <VTextCounter {...counterResult} />;
    };

    return () => {
      return (
        <VFormControl
          nodeControl={inputControl}
          focused={inputControl.focused}
          class={['v-textarea', control.classes.value]}
          label={props.label}
          hint={props.hint}
          hinttip={props.hinttip}
          hiddenInfo={props.hiddenInfo}
          requiredChip={props.requiredChip}
          onClickLabel={(ev) => {
            inputControl.focus();
          }}
          v-slots={{
            ...ctx.slots,
            default: defaultSlot,
            infoAppends: infoAppendsSlot,
          }}
        />
      );
    };
  },
});
