import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import { Italic, ItalicOptions } from '@tiptap/extension-italic';

export const WysiwygFormatItalicTool: WysiwygEditorToolFactory<
  ItalicOptions
> = (vui, options) => {
  const tool: WysiwygEditorTool = {
    key: 'formatItalic',
    icon: vui.icon('editorformatItalic'),
    active: ({ editor }) => editor.isActive('italic'),
    onClick: ({ editor }) => {
      editor.chain().focus().toggleItalic().run();
    },
    floating: true,
    extensions: [Italic.configure(options)],
  };
  return tool;
};
