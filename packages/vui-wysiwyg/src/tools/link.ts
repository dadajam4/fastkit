import { Link, LinkOptions } from '@tiptap/extension-link';
import { validateIf, url } from '@fastkit/vui';
import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';

export const WysiwygLinkTool: WysiwygEditorToolFactory<LinkOptions> = (
  vui,
  options,
) => {
  const tool: WysiwygEditorTool = {
    key: 'link',
    icon: vui.icon('editorLink'),
    active: ({ editor }) => editor.isActive('link'),
    onClick: async ({ vui, editor }) => {
      const { href = '' } = editor.getAttributes('link');
      const result = await vui.prompt({
        input: {
          label: 'Link URL',
          rules: [validateIf, url],
          initialValue: href,
          size: 'sm',
          autofocus: true,
        },
      });

      if (result === undefined || result === false) {
        return;
      }

      const range = editor.chain().focus().extendMarkRange('link');

      if (!result) {
        range.unsetLink().run();
      } else {
        range
          .setLink({
            href: result,
          })
          .run();
      }
    },
    floating: true,
    extensions: [
      Link.configure({
        openOnClick: false,
        ...options,
      }),
    ],
  };
  return tool;
};
