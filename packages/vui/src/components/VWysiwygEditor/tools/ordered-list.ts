import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import {
  OrderedList,
  OrderedListOptions,
} from '@tiptap/extension-ordered-list';

export const WysiwygOrderedListTool: WysiwygEditorToolFactory<
  OrderedListOptions
> = (vui, options) => {
  const tool: WysiwygEditorTool = {
    key: 'orderedList',
    icon: vui.icon('editorformatListNumbered'),
    active: ({ editor }) => editor.isActive('orderedList'),
    onClick: ({ editor }) => {
      editor.chain().focus().toggleOrderedList().run();
    },
    floating: true,
    extensions: [OrderedList.configure(options)],
  };
  return tool;
};
