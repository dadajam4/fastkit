import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import { Underline, UnderlineOptions } from '@tiptap/extension-underline';

export const WysiwygFormatUnderlineTool: WysiwygEditorToolFactory<
  UnderlineOptions
> = (vui, options) => {
  const tool: WysiwygEditorTool = {
    key: 'formatUnderline',
    icon: vui.icon('editorformatUnderline'),
    active: ({ editor }) => editor.isActive('underline'),
    onClick: ({ editor }) => {
      editor.chain().focus().toggleUnderline().run();
    },
    floating: true,
    extensions: [Underline.configure(options)],
  };
  return tool;
};
