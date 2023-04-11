import './VWysiwygEditor.scss';
import {
  defineComponent,
  PropType,
  computed,
  ref,
  watch,
  onBeforeUnmount,
  VNodeChild,
} from 'vue';
import {
  createFormControlProps,
  FormControlSlots,
  VFormControl,
  VControlField,
  createControlFieldProps,
  InputBoxSlots,
  IconName,
  createTextableProps,
  createTextableEmits,
  TextableControl,
  createControlProps,
  useControl,
  createControlFieldProviderProps,
  useControlField,
  VTextCounter,
  defineSlotsProps,
  useVui,
  VButton,
  VButtonGroup,
} from '@fastkit/vui';
import { VUI_WYSIWYG_EDITOR_SYMBOL } from '../../injections';
import {
  EditorContent,
  useEditor,
  BubbleMenu,
  FocusPosition,
} from '@tiptap/vue-3';
import { StarterKit } from '@tiptap/starter-kit';
import {
  RawWysiwygExtension,
  resolveRawWysiwygExtensions,
  RawWysiwygEditorTool,
  resolveRawWysiwygEditorTools,
  WysiwygEditorContext,
  // EditorEventsOptions,
  WysiwygEditorInitializeContext,
} from '../../schemes';

export const VWysiwygEditor = defineComponent({
  name: 'VWysiwygEditor',
  props: {
    ...createTextableProps(),
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<FormControlSlots & InputBoxSlots>(),
    extensions: {
      type: Array as PropType<RawWysiwygExtension[]>,
      default: () => [],
    },
    tools: {
      type: Array as PropType<RawWysiwygEditorTool[]>,
      default: () => [],
    },
    floatingToolbar: Boolean,
    disabledMinHeight: Boolean,
    disabledMaxHeight: Boolean,
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

    const initializeCtx = new WysiwygEditorInitializeContext(() => vui, {
      onCreate: ({ editor }) => {
        textRef.value = editor.getText();
        updateEditable();
      },
      onFocus: ({ event }) => {
        inputControl.focusHandler(event);
      },
      onBlur: ({ event }) => {
        inputControl.blurHandler(event);
      },
      onUpdate: ({ editor }) => {
        inputControl.value = editor.getHTML();
        textRef.value = editor.getText();
      },
    });

    const extensions = [
      StarterKit.configure({
        bold: false,
        bulletList: false,
        orderedList: false,
        history: false,
        italic: false,
      }),
      // Linter.configure({
      //   plugins: [BadWords(['abc', 'evidently']), Punctuation, HeadingLevel],
      // }),
      ...resolveRawWysiwygExtensions(props.extensions, initializeCtx),
      ...wysiwygSettings.value.extensions,
    ];

    const updateEditable = () => {
      if (!editor.value) return;
      editor.value.setEditable(inputControl.canOperation);
    };

    watch(() => inputControl.canOperation, updateEditable);

    watch(
      () => props.modelValue,
      (modelValue) => {
        const $editor = editor.value;
        if (!$editor || $editor.getHTML() === modelValue) return;

        $editor.commands.setContent(
          modelValue == null ? '' : modelValue,
          false,
        );
        textRef.value = $editor.getText();
      },
    );

    initializeCtx.on('create', ({ editor }) => {
      textRef.value = editor.getText();
      updateEditable();
    });

    const editor = useEditor({
      ...initializeCtx.editorOptions(),
      autofocus: props.autofocus,
      content: props.modelValue,
      extensions,
      editorProps: {
        attributes: {
          class: 'v-wysiwyg-editor__input__prose',
        },
      },
    });

    // editor.value.state.doc.content

    const focus = (
      position?: FocusPosition,
      options?: {
        scrollIntoView?: boolean | undefined;
      },
    ) => {
      if (!editor.value) return;
      return editor.value.chain().focus(position, options);
    };

    const blur = () => {
      if (!editor.value) return;
      return editor.value.chain().blur();
    };

    const wysiwygContext = computed<WysiwygEditorContext>(() => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const _editor = editor.value!;
      // if (!_editor) {
      //   throw new Error('missing editor value');
      // }
      return {
        vui,
        editor: _editor,
      };
    });

    const createTools = (bubbleMenu = false) => {
      const { value: settings } = wysiwygSettings;
      const { value: context } = wysiwygContext;
      const tools = bubbleMenu
        ? settings.tools.filter((t) => !!t.floating)
        : settings.tools;
      const _editor = editor.value;
      const variant = vui.setting(
        bubbleMenu ? 'containedVariant' : 'plainVariant',
      );

      return (
        <VButtonGroup
          class={[
            'v-wysiwyg-editor__toolbar',
            {
              'v-wysiwyg-editor__floating-toolbar': props.floatingToolbar,
            },
          ]}
          variant={variant}>
          {tools.map(({ key, icon, onClick, disabled, active }) => {
            const isActive =
              !!_editor && resolveContextableValue(context, active);
            const isDisabled =
              !inputControl.canOperation ||
              (!!_editor && resolveContextableValue(context, disabled));
            let iconName: IconName | undefined;
            let child: VNodeChild;

            if (typeof icon === 'function') {
              if (_editor) {
                const _child = icon(context);
                if (typeof _child === 'function') {
                  child = _child();
                } else {
                  iconName = _child as any;
                }
              }
            } else {
              iconName = icon;
            }

            if (!iconName && child == null) return;

            return (
              <VButton
                tabindex={-1}
                key={key}
                icon={iconName}
                onClick={(ev) => onClick(context, ev)}
                color={isActive ? toolButtonActiveColor : undefined}
                disabled={isDisabled}>
                {child}
              </VButton>
            );
          })}
        </VButtonGroup>
      );
    };

    onBeforeUnmount(() => {
      editor.value && editor.value.destroy();
    });

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
        class={[
          'v-wysiwyg-editor',
          this.classes,
          `v-wysiwyg-editor--${this.size}`,
          {
            'v-wysiwyg-editor--disabled-min-heihgt': this.disabledMinHeight,
            'v-wysiwyg-editor--disabled-max-heihgt': this.disabledMaxHeight,
          },
        ]}
        label={this.label}
        hint={this.hint}
        hinttip={this.hinttip}
        hiddenInfo={this.hiddenInfo}
        requiredChip={this.requiredChip}
        onClickLabel={(ev) => {
          this.focus('start', { scrollIntoView: true });
        }}
        v-slots={{
          ...this.$slots,
          default: () => {
            const { editor } = this;

            return (
              <div class="v-wysiwyg-editor__wrapper">
                {!this.isReadonly && this.createTools()}
                <VControlField
                  class="v-wysiwyg-editor__input"
                  autoHeight
                  startAdornment={this.startAdornment}
                  endAdornment={this.endAdornment}
                  size={this.size}
                  // onClickHost={(ev) => {
                  //   this.focus();
                  // }}
                  v-slots={{
                    ...this.$slots,
                    default: () => {
                      return (
                        <div class="v-wysiwyg-editor__body">
                          <EditorContent
                            {...({
                              class: 'v-wysiwyg-editor__input__element wysiwyg',
                            } as any)}
                            editor={editor}
                          />
                          {!this.floatingToolbar &&
                            !!editor &&
                            !this.isReadonly && (
                              <BubbleMenu
                                {...({
                                  class: 'v-wysiwyg-editor__bubble-menu',
                                } as any)}
                                editor={editor}>
                                {this.createTools(true)}
                              </BubbleMenu>
                            )}
                        </div>
                      );
                    },
                  }}
                />
              </div>
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
