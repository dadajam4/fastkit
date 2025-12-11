import './VFileInput.scss';
import { defineComponent, computed } from 'vue';
import {
  createFileInputNodeSettings,
  useFileInputNodeControl,
  createFormNodeWrapperProps,
  FormNodeWrapperSlots,
  FileInputNodeEmits,
  type FileInputNodeControl,
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
import { colorSchemeProps } from '@fastkit/vue-color-scheme';
import { VUI_FILE_INPUT_SYMBOL, useVui } from '../../injections';
import { VButton } from '../VButton';

const { props, emits } = createFileInputNodeSettings();

const slots = defineSlots<
  FormNodeWrapperSlots &
    InputBoxSlots & {
      selections?: (control: FileInputNodeControl) => any;
    }
>();

function createFileInputProps() {
  return {
    ...props,
    ...colorSchemeProps(),
    ...createFormNodeWrapperProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...slots(),
    buttonText: {
      type: String,
      default: 'Choose File',
    },
    truncateLength: {
      type: [Number, String],
      default: 22,
    },
  };
}

export type FileInputPropsOptions = ReturnType<typeof createFileInputProps>;

export type FileInputEmits = FileInputNodeEmits;

export type FileInputInput = ExtractPropInput<
  ReturnType<typeof createFileInputProps>
>;

export const VFileInput = defineComponent({
  name: 'VFileInput',
  props: createFileInputProps(),
  emits,
  slots,
  setup(props, ctx) {
    const vui = useVui();
    const inputControl = useFileInputNodeControl(props, ctx, {
      nodeType: VUI_FILE_INPUT_SYMBOL,
    });
    const control = useControl(props);
    useControlField(props);

    const classes = computed(() => ['v-file-input', control.classes.value]);

    const handleClickLabel = (ev: PointerEvent) => {
      inputControl.focus();
    };

    const endAdornmentSlot = () => {
      // }
      if (props.clearable && inputControl.value.length) {
        return (
          <VButton
            key="clear"
            icon={vui.icon('clear')}
            rounded
            onClick={(ev) => {
              ev.stopPropagation();
              inputControl.clear();
            }}
          />
        );
      }
    };

    const showDialog = () => {
      if (inputControl.canOperation) {
        inputControl.inputElement?.click();
      }
    };

    const renderSelections = () => {
      if (ctx.slots.selections) {
        return ctx.slots.selections(inputControl);
      }

      const { files } = inputControl.selectionContext;
      if (!files.length)
        return (
          <span class="v-file-input__placeholder">
            {inputControl.placeholder || 'No file chosen'}
          </span>
        );
      return files.map((file) => file.truncatedName).join(', ');
    };

    const defaultSlot = () => (
      <div class="v-file-input__inner">
        <VButton
          key="open"
          class="v-file-input__button"
          color={'base' as any}
          size={props.size}
          startIcon={vui.icon('fileUpload')}
          variant={vui.setting('containedVariant')}
          onClick={showDialog}>
          {props.buttonText}
        </VButton>
        <VControlField
          class="v-file-input__input"
          startAdornment={props.startAdornment}
          endAdornment={props.endAdornment}
          size={control.size.value}
          onClick={showDialog}
          autoHeight
          v-slots={{
            ...ctx.slots,
            default: withCtx(() => [
              inputControl.createInputElement({
                class: 'v-file-input__input__element',
              }),
              <div class="v-file-input__selections">{renderSelections()}</div>,
            ]),
            endAdornment: withCtx(endAdornmentSlot),
          }}
        />
      </div>
    );

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
          // infoAppends: withCtx(infoAppendsSlot),
        }}
      />
    );
  },
});
