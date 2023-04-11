import { defineComponent, computed } from 'vue';
import { VApp } from '@fastkit/vui';
import { VPage } from '@fastkit/vue-page';
import { i18n } from '@@';
import { useHead } from '@vueuse/head';

export const App = defineComponent({
  name: 'App',
  setup() {
    const space = i18n.use();
    const htmlAttrs = computed(() => ({
      lang: space.currentLocaleName,
    }));

    useHead({
      htmlAttrs,
    });

    return () => (
      <VApp>
        <VPage />
      </VApp>
    );
  },
});
