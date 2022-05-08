import './color.scss';

import { VNodeChild } from 'vue';
import { WysiwygColorExtension } from '../extensions';
import { type VuiService } from '../../../service';
import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import TextStyle from '@tiptap/extension-text-style';
import { VIcon } from '../../VIcon';

export interface WysiwygColorItem {
  key?: string | number;
  name?: VNodeChild | ((vui: VuiService) => VNodeChild);
  color: string | null;
}

function createColorItems(
  items: WysiwygColorItem[],
  opts: {
    withLabel?: boolean;
    onSelect: (item: WysiwygColorItem) => any;
  },
) {
  const { withLabel, onSelect } = opts;
  return (
    <div
      class={[
        'v-wysiwyg-color-tool__items',
        { 'v-wysiwyg-color-tool__items--with-label': withLabel },
      ]}>
      {items.map((item, index) => (
        <button
          key={item.key == null ? index : item.key}
          class="v-wysiwyg-color-tool__item"
          type="button"
          onClick={() => onSelect(item)}>
          <span
            class="v-wysiwyg-color-tool__item__color"
            style={item.color ? { color: item.color } : {}}
          />
          {withLabel && (
            <span class="v-wysiwyg-color-tool__item__name">{item.name}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export interface CreateWysiwygColorToolOptions {
  items: WysiwygColorItem[];
  withLabel?: boolean;
}

export function createWysiwygColorTool(opts: CreateWysiwygColorToolOptions) {
  const WysiwygColorTool: WysiwygEditorToolFactory = (vui) => {
    const tool: WysiwygEditorTool = {
      key: 'textColor',
      icon: () => () =>
        (
          <span class="v-wysiwyg-color-tool__button">
            <VIcon
              class="v-wysiwyg-color-tool__button__icon"
              name={vui.icon('editorTextColor')}
            />
            <span class="v-wysiwyg-color-tool__button__bar" />
          </span>
        ),
      onClick: (ctx) => {
        const body = createColorItems(opts.items, {
          withLabel: opts.withLabel,
          onSelect: (item) => {
            const { color } = item;
            let command = ctx.editor.chain().focus();
            if (color) {
              command = command.setColor(color);
            } else {
              command = command.unsetColor();
            }
            command.run();
          },
        });
        ctx.vui.dialog({
          props: {
            class: 'v-wysiwyg-color-tool__menu',
          },
          children: [body],
        });
      },
      floating: true,
      extensions: [TextStyle, WysiwygColorExtension],
    };
    return tool;
  };

  return WysiwygColorTool;
}
