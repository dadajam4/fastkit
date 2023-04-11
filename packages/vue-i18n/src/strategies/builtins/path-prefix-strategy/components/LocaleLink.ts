import { defineComponent, computed, h } from 'vue';
import { RouterLink, useLink as _useLink, UseLinkOptions } from 'vue-router';
import { useI18nSpace } from '../../../../injections';
import type { PathPrefixStrategyCustomInterface } from '../path-prefix-strategy';

/**
 * vue-router's useLink method considering i18n space expansion
 *
 * @see {@link _useLink | useLink}
 */
export function useLink(props: UseLinkOptions): ReturnType<typeof _useLink> {
  const space = useI18nSpace<PathPrefixStrategyCustomInterface>();
  const location = space.location((props as any).to);
  return _useLink({ to: location.fullPath });
}

/**
 * {@link RouterLink} with automatic application of the locale selected in the space
 *
 * @see {@link RouteStrategyCustomInterface.location}
 * @see {@link RouterLink}
 */
export const LocaleLink = defineComponent({
  name: 'LocaleLink',
  props: (RouterLink as any).props,
  setup(props, ctx) {
    const space = useI18nSpace<PathPrefixStrategyCustomInterface>();
    const location = computed(() => space.location((props as any).to));

    return () => {
      return h(RouterLink as any, { ...props, to: location }, ctx.slots);
    };
  },
});
