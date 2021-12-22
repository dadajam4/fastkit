import './VWysiwygEditor.scss';
import { defineComponent, Fragment, PropType, computed, ref, watch } from 'vue';
import {
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
import { IconName } from '../VIcon';
import {
  createTextableProps,
  createTextableEmits,
  TextableControl,
} from '@fastkit/vue-form-control';
import {
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
} from '../../composables';
import { VTextCounter } from '../VTextCounter';
import { VUI_WYSIWYG_EDITOR_SYMBOL, useVui } from '../../injections';
import {
  EditorContent,
  useEditor,
  BubbleMenu,
  FocusPosition,
} from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { VButton, VButtonGroup } from '../VButton';
import {
  RawWysiwygEditorTool,
  resolveRawWysiwygEditorTools,
  WysiwygEditorContext,
} from './schemes';

export const VWysiwygEditor = defineComponent({
  name: 'VWysiwygEditor',
  props: {
    // ...props,
    ...createTextableProps(),
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<FormControlSlots & InputBoxSlots>(),
    tools: {
      type: Array as PropType<RawWysiwygEditorTool[]>,
      default: () => [],
    },
  },
  emits: {
    ...createTextableEmits(),
  },
  setup(props, ctx) {
    const vui = useVui();

    const textRef = ref('');
    const toolButtonActiveColor = vui.setting('primaryScope');

    const wysiwygSettings = computed(() =>
      resolveRawWysiwygEditorTools(props.tools, vui),
    );

    const control = useControl(props);
    useControlField(props);

    const inputControl = new TextableControl(props, ctx as any, {
      nodeType: VUI_WYSIWYG_EDITOR_SYMBOL,
      validationValue: () => textRef.value,
    });

    const extensions = [
      StarterKit.configure({
        bold: false,
        bulletList: false,
        orderedList: false,
        history: false,
        italic: false,
      }),
      ...wysiwygSettings.value.extensions,
    ];

    const updateEditable = () => {
      if (!editor.value) return;
      editor.value.setEditable(inputControl.canOperation);
    };

    watch(() => inputControl.canOperation, updateEditable);

    const editor = useEditor({
      onCreate: ({ editor }) => {
        textRef.value = editor.getText();
        updateEditable();
      },
      onFocus: (ctx) => {
        inputControl.focusHandler(ctx.event);
      },
      onBlur: (ctx) => {
        inputControl.blurHandler(ctx.event);
      },
      onUpdate: (ev) => {
        inputControl.value = ev.editor.getHTML();
        textRef.value = ev.editor.getText();
      },
      autofocus: props.autofocus,
      content: props.modelValue,
      extensions,
      editorProps: {
        attributes: {
          class: 'v-wysiwyg-editor__input__prose',
        },
      },
    });

    const focus = (
      position?: FocusPosition,
      options?: {
        scrollIntoView?: boolean | undefined;
      },
    ) => {
      return editor.value.chain().focus(position, options);
    };

    const blur = () => {
      return editor.value.chain().blur();
    };

    const wysiwygContext = computed<WysiwygEditorContext>(() => ({
      vui,
      editor: editor.value,
    }));

    const createTools = (floating = false) => {
      const { value: settings } = wysiwygSettings;
      const { value: context } = wysiwygContext;
      const tools = floating
        ? settings.tools.filter((t) => !!t.floating)
        : settings.tools;
      const _editor = editor.value;
      const variant = vui.setting(
        floating ? 'containedVariant' : 'plainVariant',
      );

      return (
        <VButtonGroup variant={variant}>
          {tools.map(({ key, icon, onClick, disabled, active }) => {
            const isActive =
              !!_editor && resolveContextableValue(context, active);
            const isDisabled =
              !inputControl.canOperation ||
              (!!_editor && resolveContextableValue(context, disabled));
            let iconName: IconName | undefined;

            if (typeof icon === 'function') {
              if (_editor) {
                iconName = icon(context);
              }
            } else {
              iconName = icon;
            }

            if (!iconName) return;

            return (
              <VButton
                key={key}
                icon={iconName}
                onClick={(ev) => onClick(context, ev)}
                color={isActive ? toolButtonActiveColor : undefined}
                disabled={isDisabled}
              />
            );
          })}
        </VButtonGroup>
      );
    };

    return {
      editor,
      ...inputControl.expose(),
      ...control,
      focus,
      blur,
      createTools,
    };
  },
  render() {
    return (
      <VFormControl
        nodeControl={this.nodeControl}
        focused={this.nodeControl.focused}
        class={['v-wysiwyg-editor', this.classes]}
        label={this.label}
        hint={this.hint}
        hiddenInfo={this.hiddenInfo}
        onClickLabel={(ev) => {
          this.focus('start', { scrollIntoView: true });
        }}
        v-slots={{
          ...this.$slots,
          default: () => {
            const { editor } = this;

            return (
              <Fragment>
                {!this.isReadonly && this.createTools()}
                <VControlField
                  class="v-wysiwyg-editor__input"
                  autoHeight
                  startAdornment={this.startAdornment}
                  endAdornment={this.endAdornment}
                  // onClickHost={(ev) => {
                  //   this.focus();
                  // }}
                  v-slots={{
                    ...this.$slots,
                    default: () => {
                      return (
                        <Fragment>
                          <EditorContent
                            class="v-wysiwyg-editor__input__element wysiwyg"
                            editor={editor}
                          />
                          {!!editor && !this.isReadonly && (
                            <BubbleMenu
                              class="v-wysiwyg-editor__bubble-menu"
                              editor={editor}>
                              {this.createTools(true)}
                            </BubbleMenu>
                          )}
                        </Fragment>
                      );
                    },
                  }}
                />
              </Fragment>
            );
          },
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

function resolveContextableValue(
  ctx: WysiwygEditorContext,
  source?: boolean | ((ctx: WysiwygEditorContext) => boolean),
) {
  return typeof source === 'function' ? source(ctx) : source;
}
