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

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

function escapeHtml(source: string): string {
  return source.replace(/[&<>"]/g, (char) => HTML_ESCAPES[char]);
}

export function highlight(
  code: string,
  language?: string,
  options: PrismHighlightOptions = {},
): PrismHighlightResult {
  const stripedCode = trimCode(code);
  const { inline = !stripedCode.includes('\n'), attrs = {} } = options;

  /**
   * A fenced block with no language reaches `marked`'s renderer as `''`, which
   * a default parameter does not cover -- it only fires on `undefined`.
   */
  const resolvedLanguage = language || 'markup';
  const prismLanguage = Prism.languages[resolvedLanguage];

  if (import.meta.env.DEV && !prismLanguage) {
    // eslint-disable-next-line no-console
    console.warn(
      `[VPrism] No Prism component for language "${resolvedLanguage}". Rendering it unhighlighted. See all available ones: https://cdn.jsdelivr.net/npm/prismjs/components/`,
    );
  }

  const className = `language-${resolvedLanguage}`;
  const classBinding = ['v-prism', attrs.class, className];

  /**
   * An unknown language is rendered as plain escaped text rather than taken as
   * fatal. A documentation build should not be brought down by a code fence.
   */
  const highlighted = prismLanguage
    ? Prism.highlight(stripedCode, prismLanguage, resolvedLanguage)
    : escapeHtml(stripedCode);

  const result: PrismHighlightResult = {
    highlighted,
    inline,
    language: resolvedLanguage,
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
