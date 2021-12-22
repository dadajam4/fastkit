import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';

export const WysiwygTextColorTool: WysiwygEditorToolFactory = (vui) => {
  const tool: WysiwygEditorTool = {
    key: 'textColor',
    icon: vui.icon('editorTextColor'),
    // icon: (gen) => vui.icon('editorTextColor'),
    onClick: (ctx) => {
      ctx.vui.alert('ok');
    },
    floating: true,
  };
  return tool;
};
