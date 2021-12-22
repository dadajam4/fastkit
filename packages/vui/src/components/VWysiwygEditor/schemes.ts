import { type VuiService } from '../../service';
import { type Editor, type Extensions } from '@tiptap/vue-3';
import { type IconName } from '../VIcon';

export interface WysiwygEditorContext {
  editor: Editor;
  vui: VuiService;
}

export interface WysiwygEditorTool {
  key: string;
  icon: IconName | ((ctx: WysiwygEditorContext) => IconName);
  active?: boolean | ((ctx: WysiwygEditorContext) => boolean);
  disabled?: boolean | ((ctx: WysiwygEditorContext) => boolean);
  onClick: (ctx: WysiwygEditorContext, ev: MouseEvent) => any;
  floating?: boolean;
  extensions?: Extensions;
}

export type WysiwygEditorToolFactory<Options = void> = (
  vui: VuiService,
  options?: Options,
) => WysiwygEditorTool | WysiwygEditorTool[];

export type RawWysiwygEditorTool =
  | WysiwygEditorTool
  | WysiwygEditorToolFactory<any>;

function resolveRawWysiwygEditorTool(
  raw: RawWysiwygEditorTool,
  vui: VuiService,
) {
  return typeof raw === 'function' ? raw(vui) : raw;
}

export interface ResolvedWysiwygEditorSettings {
  tools: WysiwygEditorTool[];
  extensions: Extensions;
}

export function resolveRawWysiwygEditorTools(
  raws: RawWysiwygEditorTool[],
  vui: VuiService,
): ResolvedWysiwygEditorSettings {
  const tools: WysiwygEditorTool[] = [];
  const extensions: Extensions = [];

  raws.forEach((raw) => {
    let resolved = resolveRawWysiwygEditorTool(raw, vui);
    if (!Array.isArray(resolved)) {
      resolved = [resolved];
    }
    resolved.forEach((tool) => {
      tools.push(tool);
      if (tool.extensions) {
        extensions.push(...tool.extensions);
      }
    });
  });

  return {
    tools,
    extensions,
  };
}
