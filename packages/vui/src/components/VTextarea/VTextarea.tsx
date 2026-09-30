import './VTextarea.scss';
import { defineComponent } from 'vue';
import {
  createTextareaNodeSettings,
  useTextareaNodeControl,
  createFormNodeWrapperProps,
  FormNodeWrapperSlots,
  FormNodeWrapper,
} from '@fastkit/vue-form-control';
import {
  defineSlots,
  withCtx,
  resolveVNodeChildOrSlots,
  cleanupEmptyVNodeChild,
} from '@fastkit/vue-utils';
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

const slots = defineSlots<FormNodeWrapperSlots & InputBoxSlots>();

export const VTextarea = defineComponent({
  name: 'VTextarea',
  props: {
    ...props,
    ...createFormNodeWrapperProps(),
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

    const defaultSlot = () => (
      <VControlField
        class="v-textarea__input"
        size={control.size.value}
        autoHeight
        startAdornment={props.startAdornment}
        endAdornment={props.endAdornment}
        v-slots={{
          ...ctx.slots,
          default: withCtx(() =>
            inputControl.createInputElement({
              class: 'v-textarea__input__element',
            }),
          ),
        }}
      />
    );

    // The counter takes the `infoAppends` slot of `VFormControl`, so render
    // the caller's own `infoAppends` (prop or slot) in front of it.
    const infoAppendsSlot = (wrapper: FormNodeWrapper) => {
      const slot = resolveVNodeChildOrSlots(
        props.infoAppends,
        ctx.slots.infoAppends,
      );
      const appends = (slot && cleanupEmptyVNodeChild(slot(wrapper))) || [];
      const { counterResult } = inputControl;
      return [...appends, counterResult && <VTextCounter {...counterResult} />];
    };

    return () => (
      <VFormControl
        nodeControl={inputControl}
        class={['v-textarea', control.classes.value]}
        label={props.label}
        hint={props.hint}
        hinttip={props.hinttip}
        hinttipDelay={props.hinttipDelay}
        hiddenInfo={props.hiddenInfo}
        requiredChip={props.requiredChip}
        onClickLabel={(ev) => {
          inputControl.focus();
        }}
        v-slots={{
          ...ctx.slots,
          default: withCtx(defaultSlot),
          infoAppends: withCtx(infoAppendsSlot),
        }}
      />
    );
  },
});
