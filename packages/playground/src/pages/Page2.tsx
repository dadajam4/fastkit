import './Home.scss';
import { defineComponent, ref } from 'vue';
import { useVueStack } from '@fastkit/vue-stack';
import { RouterLink } from 'vue-router';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const component = defineComponent({
  name: 'Page2View',
  setup() {
    const vueStack = useVueStack();
    const colorScheme = useColorScheme();
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    return {
      vueStack,
      colorScheme,
      disabled: ref(false),
      count: ref(0),
      stackActive: ref(false),
      persistent: ref(false),
    };
  },
  render() {
    return (
      <div
        style={{
          background: '#f00',
          margin: 'auto',
        }}>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/page2">page2</RouterLink>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえおあいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
        <p>あいうえお</p>
      </div>
    );
  },
});

export default component;
