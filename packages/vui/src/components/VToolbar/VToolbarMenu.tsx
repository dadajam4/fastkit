import './VToolbarMenu.scss';
import { defineComponent } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { VButton, vueButtonProps } from '../VButton';

export type VToolbarMenuEdge = 'start' | 'end';

export const VToolbarMenu = defineComponent({
  name: 'VToolbarMenu',
  inheritAttrs: false,
  props: {} as typeof vueButtonProps,
  setup(props, ctx) {
    return () => {
      const color = props.color || 'base';
      const variant = props.variant || 'plain';
      return (
        <VButton
          {...ctx.attrs}
          color={color}
          variant={variant}
          class={['v-toolbar-menu']}>
          {renderSlotOrEmpty(ctx.slots)}
        </VButton>
      );
    };
  },
});
