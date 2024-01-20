import { Extension, mergeAttributes, Mark } from '@tiptap/vue-3';
import '@tiptap/extension-text-style';
// import '@tiptap/vue-3';

export type WysiwygCustomTagSettings = {
  /**
   * tag name
   *
   * Either the html default tag name or a custom tag name is acceptable
   *
   * @default "span"
   */
  tag: string;

  /**
   * HTML Attributes
   *
   * Attributes to be assigned to tags such as `class`, `data-xxx`, etc.
   */
  attrs?: Record<any, string>;
};

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    customTag: {
      /**
       * Set the custom tag
       */
      setCustomTag: (markName: string) => ReturnType;
      /**
       * Toggle the custom tag
       */
      toggleCustomTag: (markName: string) => ReturnType;
      /**
       * Unset the custom tag
       */
      unsetCustomTag: (markName: string) => ReturnType;
    };
  }
}

// export type WysiwygCustomTagSettings = WysiwygCustomTagOptions & {
//   /**
//    * extension name
//    */
//   name: string;
// };

export function createWysiwygCustomTagMark(
  name: string,
  settings: Partial<WysiwygCustomTagSettings>,
) {
  const { tag = 'span', attrs } = settings;
  const attrEntries = attrs && Object.entries(attrs);
  // eslint-disable-next-line no-shadow
  const attrNames = attrEntries && attrEntries.map(([name]) => name);

  const getElementAttrs = (
    el: HTMLElement,
  ): Record<any, string> | undefined => {
    if (!attrNames) return;

    return (
      el
        .getAttributeNames()
        // eslint-disable-next-line no-shadow
        .reduce((acc, name) => ({ ...acc, [name]: el.getAttribute(name) }), {})
    );
  };

  const isMatchedElementAttrs = (elAttrs: Record<any, string>): boolean => {
    if (!attrEntries) return true;
    // eslint-disable-next-line no-shadow
    return attrEntries.every(([name, value]) => elAttrs[name] === value);
  };

  return Mark.create<WysiwygCustomTagSettings>({
    name,

    addOptions() {
      return {
        tag,
        attrs: attrs && { ...attrs },
      };
    },
    parseHTML() {
      return [
        {
          tag,
          getAttrs: (el: any) => {
            if (!attrs) return null;
            const elAttrs = getElementAttrs(el);
            if (!elAttrs) return false;
            return isMatchedElementAttrs(el) && null;
          },
        },
      ];
    },
    renderHTML({ HTMLAttributes }) {
      return [
        tag,
        attrs ? mergeAttributes(attrs, HTMLAttributes) : HTMLAttributes,
        0,
      ];
    },
  });
}

export const WysiwygCustomTagExtension =
  Extension.create<WysiwygCustomTagSettings>({
    name: 'custom-tag',
    addCommands() {
      return {
        setCustomTag:
          (markName) =>
          ({ chain }) =>
            chain().setMark(markName).run(),
        unsetCustomTag:
          (markName) =>
          ({ chain }) =>
            chain().unsetMark(markName).run(),
        toggleCustomTag:
          (markName) =>
          ({ chain }) =>
            chain().toggleMark(markName).run(),
      };
    },
  });
