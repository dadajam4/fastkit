import { defineComponent } from 'vue';
import { VAppLayout } from '@fastkit/vue-app-layout';
import { VStackRoot } from '@fastkit/vue-stack';
import { useInjectTheme } from '@fastkit/vue-color-scheme';

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
