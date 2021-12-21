import './VWysiwygEditor.scss';
import { defineComponent, Fragment } from 'vue';
import {
  // createTiptapSettings,
  // useTiptapControl,
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
  // useControl,
  createControlFieldProviderProps,
  // useControlField,
} from '../../composables';
// import { VTextCounter } from '../VTextCounter';
// import { VUI_TEXTAREA_SYMBOL, useVui } from '../../injections';
import { EditorContent, useEditor, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { VButton } from '../VButton';
// const { props, emits } = createTiptapSettings();

export const VWysiwygEditor = defineComponent({
  name: 'VWysiwygEditor',
  props: {
    // ...props,
    ...createFormControlProps(),
    ...createControlFieldProps(),
    ...createControlFieldProviderProps(),
    ...createControlProps(),
    ...defineSlotsProps<FormControlSlots & InputBoxSlots>(),
  },
  // emits,
  setup(props, ctx) {
    const editor = useEditor({
      content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
      extensions: [StarterKit],
    });
    // const vui = useVui();
    // const inputControl = useTiptapControl(props, ctx, {
    //   nodeType: VUI_TEXTAREA_SYMBOL,
    //   defaultRows: vui.tiptapRows,
    // });
    // const control = useControl(props);
    // useControlField(props);

    return {
      editor,
      // ...inputControl.expose(),
      // ...control,
    };
  },
  render() {
    return (
      <VFormControl
        nodeControl={this.nodeControl}
        // focused={this.nodeControl.focused}
        // class={['v-wysiwyg-editor', this.classes]}
        label={this.label}
        hint={this.hint}
        hiddenInfo={this.hiddenInfo}
        onClickLabel={(ev) => {
          // this.focus();
        }}
        v-slots={{
          ...this.$slots,
          default: () => (
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
                  const { editor } = this;
                  return (
                    <Fragment>
                      <EditorContent
                        class="v-wysiwyg-editor__input__element wysiwyg"
                        editor={editor}
                      />
                      {!!editor && (
                        <BubbleMenu
                          class="v-wysiwyg-editor__bubble-menu"
                          editor={editor}>
                          <VButton
                            size="sm"
                            color={
                              editor.isActive('bold') ? 'primary' : 'muted'
                            }
                            onClick={() => {
                              editor.chain().focus().toggleBold().run();
                            }}>
                            Bold
                          </VButton>
                        </BubbleMenu>
                      )}
                    </Fragment>
                  );
                },
                // this.tiptapControl.createInputElement({
                //   class: 'v-wysiwyg-editor__input__element',
                // }),
              }}
            />
          ),
          // infoAppends: () => {
          //   const { counterResult } = this;
          //   if (!counterResult) return;
          //   return <VTextCounter {...counterResult} />;
          // },
        }}
      />
    );
  },
});
