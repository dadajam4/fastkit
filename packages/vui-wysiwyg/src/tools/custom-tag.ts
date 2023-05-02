import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import {
  createWysiwygCustomTagMark,
  WysiwygCustomTagSettings,
  WysiwygCustomTagExtenstion,
} from '../extensions/custom-tag';

export interface WysiwygCustomTagToolSettings
  extends Pick<WysiwygEditorTool, 'icon' | 'floating'>,
    Partial<WysiwygCustomTagSettings> {}

/**
 * Generate Custom Tag Tool
 *
 * @param markName - Mark name
 * @param settings - Tool Configuration
 * @returns Generated Tool
 */
export function createWysiwygCustomTagTool(
  markName: string,
  settings: WysiwygCustomTagToolSettings,
): WysiwygEditorToolFactory {
  const Mark = createWysiwygCustomTagMark(markName, settings);
  const { icon, floating = true } = settings;

  return (vui) => {
    const tool: WysiwygEditorTool = {
      key: `customTag:${markName}`,
      icon,
      floating,
      active: ({ editor }) => editor.isActive(markName),
      onClick: ({ editor }) => {
        editor.chain().focus().toggleCustomTag(markName).run();
      },
      extensions: [WysiwygCustomTagExtenstion, Mark.configure(settings)],
    };
    return tool;
  };
}
