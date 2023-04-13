import { h, defineComponent, computed, withDirectives } from 'vue';
import { marked } from 'marked';
import { MarkedDirectiveArgument } from './directive';
import { useRouter } from 'vue-router';
import { i18n } from '@@';

const indentMatchRe = /^\s+/;
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

const EXTERNAL_LINK_RE = /^https?:\/\//;

interface ResolvedLink {
  href: string;
  target?: string;
}

export const VMarked = defineComponent({
  name: 'VMarked',
  props: {
    code: {
      type: String,
      required: true,
    },
  },
  setup(props, { slots, attrs }) {
    const $i18n = i18n.use();
    const localeMatchRe = new RegExp(`/(${$i18n.availableLocales.join('|')})/`);
    const router = useRouter();
    const directiveBinding = { router };

    const resolveLink = (href: string): ResolvedLink => {
      if (EXTERNAL_LINK_RE.test(href)) {
        return {
          href,
          target: '_blank',
        };
      }
      if (localeMatchRe.test(href)) {
        return { href };
      }
      href = `/${$i18n.currentLocaleName}${href}`;
      return {
        href,
      };
    };

    const renderer = new marked.Renderer();

    renderer.link = (_href, title, text) => {
      if (!_href) return text;
      const { href, target } = resolveLink(_href);
      return `<a href="${href}" ${
        target ? `target="${target}"` : `data-route="${href}"`
      }${title ? ` title="${title}"` : ''}>${text}</a>`;
    };

    const htmlRef = computed(() => {
      return marked.parse(trimWithIndent(props.code), {
        renderer,
      });
    });

    return () => {
      return withDirectives(
        h('div', {
          ...attrs,
          class: ['v-marked', attrs.class],
          innerHTML: htmlRef.value,
        }),
        [MarkedDirectiveArgument(directiveBinding)],
      );
    };
  },
});
