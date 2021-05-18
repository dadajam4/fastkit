import { defineComponent } from 'vue';
import { RouterView } from 'vue-router';
import { useInjectTheme } from '@fastkit/vue-color-scheme';
import { VStackRoot } from '@fastkit/vue-stack';

export const App = defineComponent({
  name: 'App',
  setup() {
    useInjectTheme();
  },
  render() {
    return (
      <VStackRoot class="app">
        <RouterView />
      </VStackRoot>
    );
  },
});
