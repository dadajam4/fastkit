import { defineComponent } from 'vue';
import {
  VStackRoot,
  useInjectTheme,
  renderSlotOrEmpty,
} from '@fastkit/vue-kit';

export const VApp = defineComponent({
  name: 'VApp',
  setup(props, ctx) {
    useInjectTheme();

    return () => {
      return <VStackRoot>{renderSlotOrEmpty(ctx.slots, 'default')}</VStackRoot>;
    };
  },
});
