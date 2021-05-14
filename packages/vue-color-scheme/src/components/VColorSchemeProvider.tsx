import { defineComponent, h } from 'vue';
import { useColorClasses } from '../hooks';
import { colorSchemeProps } from '../utils';

export const VColorSchemeProvider = defineComponent({
  name: 'VColorSchemeProvider',
  props: {
    ...colorSchemeProps(),
    tag: {
      type: String,
      default: 'div',
    },
  },
  setup(props) {
    const hooks = useColorClasses(props);
    return hooks;
  },
  render() {
    return h(
      this.tag,
      {
        class: this.colorClasses,
      },
      this.$slots.default,
    );
  },
});
