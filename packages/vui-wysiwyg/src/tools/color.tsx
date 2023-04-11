import './color.scss';

import { VNodeChild } from 'vue';
import { WysiwygColorExtension } from '../extensions';
import { type VuiService, VIcon } from '@fastkit/vui';
import { WysiwygEditorToolFactory, WysiwygEditorTool } from '../schemes';
import TextStyle from '@tiptap/extension-text-style';

export interface WysiwygColorItem {
  key?: string | number;
  name?: VNodeChild | ((vui: VuiService) => VNodeChild);
  color: string | null;
}

export interface CreateWysiwygColorToolOptions {
  items: WysiwygColorItem[];
  withLabel?: boolean;
}

export function createWysiwygColorTool(opts: CreateWysiwygColorToolOptions) {
  const WysiwygColorTool: WysiwygEditorToolFactory = (vui) => {
    const tool: WysiwygEditorTool = {
      key: 'textColor',
      // active: ({ editor }) => editor.isActive('textStyle'),
      icon:
        ({ editor }) =>
        () => {
          const color: string | undefined =
            editor.getAttributes('textStyle').color;
          const style = { color };
          return (
            <span class="v-wysiwyg-color-tool__button">
              <VIcon
                class="v-wysiwyg-color-tool__button__icon"
                name={vui.icon('editorTextColor')}
              />
              <span class="v-wysiwyg-color-tool__button__bar" style={style} />
            </span>
          );
        },
      onClick: (ctx, ev) => {
        ctx.vui.menu({
          class: 'v-wysiwyg-color-tool__menu',
          activator: ev,
          content: (stack) => (
            <div
              class={[
                'v-wysiwyg-color-tool__items',
                { 'v-wysiwyg-color-tool__items--with-label': opts.withLabel },
              ]}>
              {opts.items.map((item, index) => (
                <button
                  key={item.key == null ? index : item.key}
                  class="v-wysiwyg-color-tool__item"
                  type="button"
                  onClick={() => {
                    const { color } = item;
                    let command = ctx.editor.chain().focus();
                    if (color) {
                      command = command.setColor(color);
                    } else {
                      command = command.unsetColor();
                    }
                    command.run();
                    stack.close();
                  }}>
                  <span
                    class="v-wysiwyg-color-tool__item__color"
                    style={item.color ? { color: item.color } : {}}
                  />
                  {opts.withLabel && (
                    <span class="v-wysiwyg-color-tool__item__name">
                      {item.name}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ),
        });
      },
      floating: true,
      extensions: [TextStyle, WysiwygColorExtension],
    };
    return tool;
  };

  return WysiwygColorTool;
}
