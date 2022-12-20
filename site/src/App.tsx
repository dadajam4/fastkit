import { defineComponent, computed } from 'vue';
import { VApp } from '@fastkit/vui';
import { VPage } from '@fastkit/vue-page';
import { useRouter } from 'vue-router';
import { i18n } from '~/i18n';
import { useHead } from '@vueuse/head';

export const App = defineComponent({
  name: 'App',
  setup() {
    useRouter();

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
