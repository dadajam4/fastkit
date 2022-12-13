import { defineComponent, computed, h } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18nSpace } from '../../../../injections';
import type { PathPrefixStrategyCustomInterface } from '../path-prefix-strategy';

/**
 * RouterLink with automatic application of the locale selected in the space
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
