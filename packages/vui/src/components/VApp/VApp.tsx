import { defineComponent } from 'vue';
import { VAppLayout } from '@fastkit/vue-app-layout';
import { VStackContainer } from '@fastkit/vue-stack';
import { useInjectTheme } from '@fastkit/vue-color-scheme';

export const VApp = defineComponent({
  name: 'VApp',
  setup(props, ctx) {
    useInjectTheme();

    return () => {
      return (
        <VStackContainer>
          <VAppLayout v-slots={ctx.slots} />
        </VStackContainer>
      );
    };
  },
});
