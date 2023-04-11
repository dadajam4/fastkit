import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import { Bold, BoldOptions } from '@tiptap/extension-bold';

export const WysiwygFormatBoldTool: WysiwygEditorToolFactory<BoldOptions> = (
  vui,
  options,
) => {
  const tool: WysiwygEditorTool = {
    key: 'formatBold',
    icon: vui.icon('editorformatBold'),
    active: ({ editor }) => editor.isActive('bold'),
    onClick: ({ editor }) => {
      editor.chain().focus().toggleBold().run();
    },
    floating: true,
    extensions: [Bold.configure(options)],
  };
  return tool;
};
