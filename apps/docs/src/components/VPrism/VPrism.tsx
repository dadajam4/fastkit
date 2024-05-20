import { defineComponent } from 'vue';
import { defineSlots } from '@fastkit/vui';
import './VPrism.scss';
import { useHighlighter } from './prism';

const slots = defineSlots<{
  default?: () => any;
  appends?: (ctx: { code: string; el: () => HTMLElement }) => any;
}>();

export const VPrism = defineComponent({
  name: 'VPrism',
  props: {
    code: String,
    inline: Boolean,
    language: {
      type: String,
      default: 'markup',
    },
    ...slots(),
  },
  slots,
  setup(props, ctx) {
    const highlighter = useHighlighter(ctx);

    return () => {
      const { inline, language } = props;
      // eslint-disable-next-line no-shadow
      const { slots } = ctx;

      let { code } = props;
      if (!code) {
        const firstChild = slots?.default?.()?.[0];
        const children = firstChild?.children;
        const child = Array.isArray(children) ? children[0] : children;
        code =
          // eslint-disable-next-line no-nested-ternary
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
