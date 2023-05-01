import { defineComponent } from 'vue';
import { defineSlotsProps } from '@fastkit/vui';
import './VPrism.scss';
import { useHighlighter } from './prism';

export const VPrism = defineComponent({
  name: 'VPrism',
  props: {
    code: String,
    inline: Boolean,
    language: {
      type: String,
      default: 'markup',
    },
    ...defineSlotsProps<{
      appends: { code: string; el: () => HTMLElement };
    }>(),
  },
  setup(props, ctx) {
    const highlighter = useHighlighter(ctx);

    return () => {
      const { inline, language } = props;
      const { slots } = ctx;

      let { code } = props;
      if (!code) {
        const firstChild = slots?.default?.()?.[0];
        const children = firstChild?.children;
        const child = Array.isArray(children) ? children[0] : children;
        code =
          typeof child === 'object'
            ? ((child as any).children as string)
            : typeof child === 'string'
            ? child
            : '';
      }

      return highlighter.highlight(code, language, { inline });
    };
  },
});
