import './VStackBtn.scss';
import { defineComponent, ExtractPropTypes } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import {
  navigationableEmits,
  navigationableProps,
  useNavigationable,
} from '@fastkit/vue-utils';

const props = {
  ...colorSchemeProps({ defaultScope: 'base', defaultVariant: 'contained' }),
  ...navigationableProps,
  spacer: Boolean,
};

export type VStackBtnProps = Partial<ExtractPropTypes<typeof props>>;

export const VStackBtn = defineComponent({
  name: 'VStackBtn',
  props,
  emits: {
    ...navigationableEmits.emits,
  },
  setup(props) {
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
        class={[
          'v-stack-btn',
          colorClasses,
          classes,
          this.spacer ? 'v-stack-btn--spacer' : undefined,
        ]}
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
