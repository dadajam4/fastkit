import './VStackBtn.scss';
import { defineComponent, ExtractPropTypes } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import {
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  ExtractPropInput,
} from '@fastkit/vue-utils';
import { useVueStack } from '../composables';

export const stackBtnProps = {
  ...colorSchemeProps({
    // defaultScope: 'base' as any,
    // defaultVariant: 'contained' as any,
  }),
  ...navigationableProps,
  spacer: Boolean,
};

export type VStackBtnProps = ExtractPropInput<typeof stackBtnProps>;

export type VStackBtnResolvedProps = ExtractPropTypes<typeof stackBtnProps>;

export const VStackBtn = defineComponent({
  name: 'VStackBtn',
  props: stackBtnProps,
  emits: {
    ...navigationableEmits.emits,
  },
  setup(props) {
    const vstack = useVueStack();
    const color = useColorClasses({
      color: () => props.color || vstack.buttonDefaultScope,
      variant: () => props.variant || vstack.buttonDefaultVariant,
    });
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
