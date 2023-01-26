import { defineComponent } from 'vue';
import { VAppLayout, VStackRoot, useInjectTheme } from '@fastkit/vue-kit';

export const VApp = defineComponent({
  name: 'VApp',
  setup(props, ctx) {
    useInjectTheme();

    return () => {
      return (
        <VStackRoot>
          <VAppLayout v-slots={ctx.slots} />
        </VStackRoot>
      );
    };
  },
});
