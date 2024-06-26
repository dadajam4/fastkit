import { h, defineComponent, computed, withDirectives } from 'vue';
import { marked } from 'marked';
import { useRouter } from 'vue-router';
import { MarkedDirectiveArgument } from './directive';
import { i18n } from '@@';
import { trimCode } from '../VPrism/utils';
import { highlight } from '../VPrism/prism';

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

    renderer.link = ({ href: _href, text, title }) => {
      if (!_href) return text;
      const { href, target } = resolveLink(_href);
      return `<a href="${href}" ${
        target ? `target="${target}"` : `data-route="${href}"`
      }${title ? ` title="${title}"` : ''}>${text}</a>`;
    };

    renderer.code = ({ text, lang }) => {
      const result = highlight(text, lang);
      return result.html();
    };

    const htmlRef = computed(() =>
      marked.parse(trimCode(props.code), {
        renderer,
      }),
    );

    return () =>
      withDirectives(
        h('div', {
          ...attrs,
          class: ['v-marked', attrs.class],
          innerHTML: htmlRef.value,
        }),
        [MarkedDirectiveArgument(directiveBinding)],
      );
  },
});
