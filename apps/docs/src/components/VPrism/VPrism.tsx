import { h, defineComponent, ref } from 'vue';
import { defineSlotsProps } from '@fastkit/vui';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import './VPrism.scss';

const indentMatchRe = /^\s?/;
const trimMatchRe = /(^\n+|\n\s+$)/g;
function trimWithIndent(str: string) {
  str = str.replace(trimMatchRe, '');

  const rows = str.split('\n');
  let minLength = -1;
  for (const row of rows) {
    const spaceMatch = row.match(indentMatchRe);
    if (!spaceMatch) {
      continue;
    }
    const length = spaceMatch[0].length;
    if (minLength === -1 || length < minLength) {
      minLength = length;
    }
  }
  if (!minLength) return str;
  const replacement = ' '.repeat(minLength);
  return rows.map((row) => row.replace(replacement, '')).join('\n');
}

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
  setup(props, { slots, attrs }) {
    return () => {
      const { inline, language } = props;
      const prismLanguage = Prism.languages[language];
      const codeRef = ref<HTMLElement | null>(null);
      const el = () => codeRef.value;

      if (import.meta.env.DEV && !prismLanguage) {
        throw new Error(
          `Prism component for language "${language}" was not found, did you forget to register it? See all available ones: https://cdn.jsdelivr.net/npm/prismjs/components/`,
        );
      }

      const className = `language-${language}`;
      const classBinding = ['v-prism', attrs.class, className];

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

      code = trimWithIndent(code);

      const innerHTML = Prism.highlight(code, prismLanguage, language);
      const appendsSlot = slots?.appends?.({ code, el });

      if (inline) {
        return h('code', {
          ref: codeRef,
          class: ['v-prism--inline', classBinding],
          innerHTML,
        });
      }

      return h(
        'pre',
        {
          ...attrs,
          class: ['v-prism--block', classBinding],
        },
        [
          h('code', {
            ...attrs,
            ref: codeRef,
            class: className,
            innerHTML,
          }),
          appendsSlot,
        ],
      );
    };
  },
});
