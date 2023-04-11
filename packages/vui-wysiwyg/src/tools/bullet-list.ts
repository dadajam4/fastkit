import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import { BulletList, BulletListOptions } from '@tiptap/extension-bullet-list';

export const WysiwygBulletListTool: WysiwygEditorToolFactory<
  BulletListOptions
> = (vui, options) => {
  const tool: WysiwygEditorTool = {
    key: 'bulletList',
    icon: vui.icon('editorformatListBulleted'),
    active: ({ editor }) => editor.isActive('bulletList'),
    onClick: ({ editor }) => {
      editor.chain().focus().toggleBulletList().run();
    },
    floating: true,
    extensions: [BulletList.configure(options)],
  };
  return tool;
};
