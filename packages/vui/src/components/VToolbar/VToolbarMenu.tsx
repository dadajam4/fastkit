import './VToolbarMenu.scss';
import { defineComponent } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { VButton, vueButtonProps } from '../VButton';
import { useVui } from '../../injections';

export type VToolbarMenuEdge = 'start' | 'end';

export const VToolbarMenu = defineComponent({
  name: 'VToolbarMenu',
  inheritAttrs: false,
  props: {} as typeof vueButtonProps,
  setup(props, ctx) {
    const vui = useVui();
    const plain = vui.setting('plainVariant');

    return () => {
      const variant = props.variant || plain;
      return (
        <VButton {...ctx.attrs} variant={variant} class={['v-toolbar-menu']}>
          {renderSlotOrEmpty(ctx.slots)}
        </VButton>
      );
    };
  },
});
