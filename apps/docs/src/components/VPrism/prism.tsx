import { VNode, h, VNodeChild, ref, SetupContext } from 'vue';
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
import { trimCode } from './utils';

Prism.manual = true;

export interface PrismHighlightedChild {
  tag: string;
  class: string;
  html: string;
}

export interface PrismHighlightOptions {
  inline?: boolean;
  attrs?: Record<any, any>;
}

export type PrismHighlightAppendsSlot = (ctx: {
  code: string;
  el: () => HTMLElement;
}) => VNodeChild;

export interface PrismHighlightResult {
  highlighted: string;
  language: string;
  inline: boolean;
  html(): string;
  className: string;
  classBinding: string[];
}

export function highlight(
  code: string,
  language = 'markup',
  options: PrismHighlightOptions = {},
): PrismHighlightResult {
  const stripedCode = trimCode(code);
  const { inline = !stripedCode.includes('\n'), attrs = {} } = options;

  const prismLanguage = Prism.languages[language];

  if (import.meta.env.DEV && !prismLanguage) {
    throw new Error(
      `Prism component for language "${language}" was not found, did you forget to register it? See all available ones: https://cdn.jsdelivr.net/npm/prismjs/components/`,
    );
  }

  const className = `language-${language}`;
  const classBinding = ['v-prism', attrs.class, className];

  const highlighted = Prism.highlight(stripedCode, prismLanguage, language);

  const result: PrismHighlightResult = {
    highlighted,
    inline,
    language,
    className,
    classBinding,
    html() {
      if (inline) {
        return `<code class="${['v-prism--inline', ...classBinding].join(
          ' ',
        )}">${highlighted}</code>`;
      }

      return `<pre class="${['v-prism--block', ...classBinding].join(
        ' ',
      )}"><code class="${className}">${highlighted}</code></pre>`;
    },
  };

  return result;
}

export function useHighlighter(ctx: SetupContext) {
  const codeRef = ref<HTMLElement | null>(null);
  const el = () => codeRef.value;

  return {
    highlight(
      code: string,
      language?: string,
      options?: PrismHighlightOptions,
    ): VNode {
      const { highlighted, className, classBinding, inline } = highlight(
        code,
        language,
        options,
      );
      const appendsSlot = ctx.slots?.appends?.({ code, el });

      if (inline) {
        return h('code', {
          ref: codeRef,
          class: ['v-prism--inline', classBinding],
          innerHTML: highlighted,
        });
      }

      return h(
        'pre',
        {
          ...ctx.attrs,
          class: ['v-prism--block', classBinding],
        },
        [
          h('code', {
            ...ctx.attrs,
            ref: codeRef,
            class: className,
            innerHTML: highlighted,
          }),
          appendsSlot,
        ],
      );
    },
  };
}
