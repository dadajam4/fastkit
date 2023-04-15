import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import { TextAlign, TextAlignOptions } from '@tiptap/extension-text-align';
import { type Editor } from '@tiptap/vue-3';
import { VuiServiceIconSettings, VButtonGroup, VButton } from '@fastkit/vui';

/**
 * A list of available options for the text align attribute.
 * @remarks
 * `"justify"` has not yet been adopted because of ambiguity in browser support.
 */
export const WYSIWYG_TEXT_ALIGN_VALUES = [
  'left',
  'center',
  'right',
  // 'justify',
] as const;

/** Text align value */
export type WysiwygTextAlignValue = (typeof WYSIWYG_TEXT_ALIGN_VALUES)[number];

/**
 * A list of nodes where the text align attribute should be applied to.
 */
const DEFAULT_TYPES = ['heading', 'paragraph'] as const;

export interface WysiwygTextAlignOptions {
  /**
   * A list of nodes where the text align attribute should be applied to. Usually something like `['heading', 'paragraph']`
   * @default DEFAULT_TYPES
   * @see {@link DEFAULT_TYPES}
   */
  types?: TextAlignOptions['types'];
  /**
   * A list of available options for the text align attribute.
   * @default WYSIWYG_TEXT_ALIGN_VALUES
   * @see {@link WYSIWYG_TEXT_ALIGN_VALUES}
   */
  alignments?: WysiwygTextAlignValue[];
  /**
   * The default text align.
   * @default left
   */
  defaultAlignment: WysiwygTextAlignValue;
}

const conditions = WYSIWYG_TEXT_ALIGN_VALUES.map<
  [WysiwygTextAlignValue, { textAlign: WysiwygTextAlignValue }]
>((value) => {
  return [value, { textAlign: value }];
});

const ICON_AT: Record<WysiwygTextAlignValue, keyof VuiServiceIconSettings> = {
  left: 'editorAlignLeft',
  center: 'editorAlignCenter',
  right: 'editorAlignRight',
};

function resolveOptions(
  rawOptions: Partial<WysiwygTextAlignOptions> | undefined,
): Required<WysiwygTextAlignOptions> {
  const types = rawOptions?.types || DEFAULT_TYPES.slice();
  const alignments =
    rawOptions?.alignments || WYSIWYG_TEXT_ALIGN_VALUES.slice();
  const defaultAlignment = rawOptions?.defaultAlignment || 'left';

  return {
    types,
    alignments,
    defaultAlignment,
  };
}
function getCurrentAlign(
  editor: Editor,
  options: WysiwygTextAlignOptions,
): WysiwygTextAlignValue {
  for (const [align, condition] of conditions) {
    if (editor.isActive(condition)) return align;
  }
  return options.defaultAlignment;
}

export const WysiwygTextAlignTool: WysiwygEditorToolFactory<
  WysiwygTextAlignOptions
> = (vui, options) => {
  const resolvedOptions = resolveOptions(options);
  const { alignments } = resolvedOptions;

  const getIcon = (value: WysiwygTextAlignValue) => {
    const iconKey = ICON_AT[value];
    const icon = vui.icon(iconKey);
    if (icon === '$empty' || typeof icon === 'function') return;
    return icon;
  };

  const variant = vui.setting('plainVariant');
  const toolButtonActiveColor = vui.setting('primaryScope');

  const tool: WysiwygEditorTool = {
    key: 'textAlign',
    icon: ({ editor }) => {
      return getIcon(getCurrentAlign(editor, resolvedOptions));
    },
    onClick: async ({ vui, editor }, ev) => {
      vui.menu({
        distance: 0,
        activator: ev,
        content: (menu) => {
          return (
            <VButtonGroup variant={variant}>
              {alignments.map((value) => {
                const isActive = editor.isActive({ textAlign: value });
                return (
                  <VButton
                    tabindex={-1}
                    color={isActive ? toolButtonActiveColor : undefined}
                    key={value}
                    icon={getIcon(value)}
                    onClick={(ev) => {
                      editor.chain().focus().setTextAlign(value).run();
                    }}
                  />
                );
              })}
            </VButtonGroup>
          );
        },
      });
    },
    floating: true,
    extensions: [TextAlign.configure(resolvedOptions)],
  };
  return tool;
};
