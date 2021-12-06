import './VToolbarMenu.scss';
import { defineComponent, computed, PropType } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export type VToolbarMenuEdge = 'start' | 'end';

export const VToolbarMenu = defineComponent({
  name: 'VToolbarMenu',
  props: {
    edge: {
      type: String as PropType<VToolbarMenuEdge>,
      required: true,
    },
  },
  setup(props, ctx) {
    const edge = computed(() => props.edge);
    return () => {
      const children = renderSlotOrEmpty(ctx.slots, 'default');
      const hasChildren = !!children && children.length > 0;

      return (
        <div
          class={[
            'v-toolbar-menu',
            `v-toolbar-menu--${edge.value}`,
            {
              [`v-toolbar-menu--empty`]: !hasChildren,
            },
          ]}>
          {children}
        </div>
      );
    };
  },
});
