import './VStackBtn.scss';
import { defineComponent } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import {
  navigationableEmits,
  navigationableProps,
  useNavigationable,
} from '@fastkit/vue-utils';

export const VStackBtn = defineComponent({
  name: 'VStackBtn',
  props: {
    ...colorSchemeProps({ defaultScope: 'base' }),
    ...navigationableProps,
  },
  emits: {
    ...navigationableEmits.emits,
  },
  setup(props, ctx) {
    const color = useColorClasses(props);
    const navigationable = useNavigationable(props);
    return {
      ...color,
      navigationable,
    };
  },
  render() {
    const { navigationable, colorClasses, $slots } = this;
    const { Tag, attrs, classes } = navigationable;
    const children = $slots.default && $slots.default();
    return (
      <Tag
        class={['v-stack-btn', colorClasses, classes]}
        {...attrs}
        onClick={(ev: MouseEvent) => {
          if (this.disabled) return;
          this.$emit('click', ev);
        }}>
        {children}
      </Tag>
    );
  },
});
