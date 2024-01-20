import { defineComponent } from 'vue';
import { VAppLayout } from '@fastkit/vue-app-layout';
import { VDynamicStacks } from '@fastkit/vue-stack';
import { useInjectTheme } from '@fastkit/vue-color-scheme';

export const VApp = defineComponent({
  name: 'VApp',
  setup(_props, ctx) {
    useInjectTheme();

    return () => (
      <VDynamicStacks>
        <VAppLayout v-slots={ctx.slots} />
      </VDynamicStacks>
    );
  },
});
