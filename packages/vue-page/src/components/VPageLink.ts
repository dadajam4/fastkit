import { h, defineComponent } from 'vue';
import type { RouterLink } from 'vue-router';
import { useVuePageControl } from '../injections';

export const VPageLink = defineComponent({
  name: 'VPageLink',
  setup(props, ctx) {
    const vpc = useVuePageControl();
    return () => {
      return h(vpc.RouterLink as any, ctx.attrs, ctx.slots);
    };
  },
}) as unknown as typeof RouterLink;
