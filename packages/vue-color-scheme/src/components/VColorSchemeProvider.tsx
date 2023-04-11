import { defineComponent, h, ExtractPropTypes } from 'vue';
import { useColorClasses, colorSchemeProps } from '../service';
import { ExtractPropInput } from '@fastkit/vue-utils';

export const colorSchemeProviderProps = {
  ...colorSchemeProps(),
  tag: {
    type: String,
    default: 'div',
  },
};

export type VColorSchemeProviderProps = ExtractPropInput<
  typeof colorSchemeProviderProps
>;

export type VColorSchemeProviderResolvedProps = ExtractPropTypes<
  typeof colorSchemeProviderProps
>;

export const VColorSchemeProvider = defineComponent({
  name: 'VColorSchemeProvider',
  props: colorSchemeProviderProps,
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
