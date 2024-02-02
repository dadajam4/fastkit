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
  createFormNodeWrapperProps,
  FormNodeWrapperSlots,
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
  defineSlots,
  useVui,
  VButton,
  VButtonGroup,
} from '@fastkit/vui';
import {
  EditorContent,
  useEditor,
  BubbleMenu,
  FocusPosition,
  type Editor,
} from '@tiptap/vue-3';
import { StarterKit } from '@tiptap/starter-kit';
import { VUI_WYSIWYG_EDITOR_SYMBOL } from '../../injections';
import {
  RawWysiwygExtension,
  resolveRawWysiwygExtensions,
  RawWysiwygEditorTool,
  resolveRawWysiwygEditorTools,
  WysiwygEditorContext,
  // EditorEventsOptions,
  WysiwygEditorInitializeContext,
} from '../../schemes';

const slots = defineSlots<FormNodeWrapperSlots & InputBoxSlots>();

export interface VWysiwygEditorAPI {
  readonly editor: Editor | undefined;
  readonly control: TextableControl;
}

export const VWysiwygEditor = defineComponent({
  name: 'VWysiwygEditor',
  props: {
    ...createTextableProps(),
    ...createFormNodeWrapperProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...slots(),
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
    removeDefaultWrapper: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    ...createTextableEmits(),
  },
  slots,
  setup(props, ctx) {
    const vui = useVui();

    const textRef = ref('');
    const toolButtonActiveColor = vui.setting('primaryScope');

    const wysiwygSettings = computed(() =>
      resolveRawWysiwygEditorTools(props.tools, vui),
    );

    const control = useControl(props);
    useControlField(props);

    const classes = computed(() => [
      'v-wysiwyg-editor',
      control.classes.value,
      `v-wysiwyg-editor--${control.size.value}`,
      {
        'v-wysiwyg-editor--disabled-min-height': props.disabledMinHeight,
        'v-wysiwyg-editor--disabled-max-height': props.disabledMaxHeight,
      },
    ]);

    const inputControl = new TextableControl(props, ctx as any, {
      nodeType: VUI_WYSIWYG_EDITOR_SYMBOL,
      validationValue: () => textRef.value,
    });

    const getOutput = (
      editor: Pick<Editor, 'isEmpty' | 'getHTML' | 'getText'>,
      type: 'text' | 'html',
    ) => {
      if (props.removeDefaultWrapper && editor.isEmpty) return '';
      if (type === 'html') return editor.getHTML();
      if (type === 'text') return editor.getText();
      return '';
    };

    const initializeCtx = new WysiwygEditorInitializeContext(() => vui, {
      onCreate: ({ editor }) => {
        textRef.value = getOutput(editor, 'text');
        updateEditable();
      },
      onFocus: ({ event }) => {
        inputControl.focusHandler(event);
      },
      onBlur: ({ event }) => {
        inputControl.blurHandler(event);
      },
      onUpdate: ({ editor }) => {
        inputControl.value = getOutput(editor, 'html');
        textRef.value = getOutput(editor, 'text');
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
        if (!$editor || getOutput($editor, 'html') === modelValue) return;

        $editor.commands.setContent(
          modelValue == null ? '' : modelValue,
          false,
        );
        textRef.value = getOutput($editor, 'text');
      },
    );

    initializeCtx.on('create', ({ editor }) => {
      textRef.value = getOutput(editor, 'text');
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

    const focus = (
      position?: FocusPosition,
      options?: {
        scrollIntoView?: boolean | undefined;
      },
    ) => editor.value?.chain().focus(position, options);

    const wysiwygContext = computed<WysiwygEditorContext>(() => ({
      vui,
      editor: editor.value!,
    }));

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
              !!_editor && resolveContextualValue(context, active);
            const isDisabled =
              !inputControl.canOperation ||
              (!!_editor && resolveContextualValue(context, disabled));
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
      editor.value?.destroy();
    });

    const api: VWysiwygEditorAPI = {
      get editor() {
        return editor.value;
      },
      control: inputControl,
    };

    ctx.expose(api);

    const handleClickLabel = (ev: MouseEvent) => {
      focus('start', { scrollIntoView: true });
    };

    const defaultSlot = () => (
      <div class="v-wysiwyg-editor__body">
        <EditorContent
          class="v-wysiwyg-editor__input__element wysiwyg"
          editor={editor.value}
        />
        {!props.floatingToolbar &&
          !!editor.value &&
          !inputControl.isReadonly && (
            <BubbleMenu
              class="v-wysiwyg-editor__bubble-menu"
              editor={editor.value}>
              {createTools(true)}
            </BubbleMenu>
          )}
      </div>
    );

    const formControlDefaultSlot = () => (
      <div class="v-wysiwyg-editor__wrapper">
        {!inputControl.isReadonly && createTools()}
        <VControlField
          class="v-wysiwyg-editor__input"
          autoHeight
          startAdornment={props.startAdornment}
          endAdornment={props.endAdornment}
          size={control.size.value}
          v-slots={{
            ...ctx.slots,
            default: defaultSlot,
          }}
        />
      </div>
    );

    const infoAppendsSlot = () => {
      const { counterResult } = inputControl;
      if (!counterResult) return;
      return <VTextCounter {...counterResult} />;
    };

    return () => (
      <VFormControl
        nodeControl={inputControl}
        class={classes.value}
        label={props.label}
        hint={props.hint}
        hinttip={props.hinttip}
        hiddenInfo={props.hiddenInfo}
        requiredChip={props.requiredChip}
        onClickLabel={handleClickLabel}
        v-slots={{
          ...ctx.slots,
          default: formControlDefaultSlot,
          infoAppends: infoAppendsSlot,
        }}
      />
    );
  },
});

function resolveContextualValue(
  ctx: WysiwygEditorContext,
  // eslint-disable-next-line no-shadow
  source?: boolean | ((ctx: WysiwygEditorContext) => boolean),
) {
  return typeof source === 'function' ? source(ctx) : source;
}
