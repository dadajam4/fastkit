import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import { History, HistoryOptions } from '@tiptap/extension-history';

export const WysiwygHistoryTool: WysiwygEditorToolFactory<HistoryOptions> = (
  vui,
  options,
) => {
  const undo: WysiwygEditorTool = {
    key: 'history-undo',
    icon: vui.icon('editorUndo'),
    disabled: ({ editor }) => !editor.can().undo(),
    onClick: ({ editor }) => {
      editor.chain().focus().undo().run();
    },
    extensions: [History.configure(options)],
  };
  const redo: WysiwygEditorTool = {
    key: 'history-redo',
    icon: vui.icon('editorRedo'),
    disabled: ({ editor }) => !editor.can().redo(),
    onClick: ({ editor }) => {
      editor.chain().focus().redo().run();
    },
  };
  return [undo, redo];
};
