import './VToolbarEdge.scss';
import { defineComponent, computed, PropType } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export type VToolbarEdgeEdge = 'start' | 'end';

export const VToolbarEdge = defineComponent({
  name: 'VToolbarEdge',
  props: {
    edge: {
      type: String as PropType<VToolbarEdgeEdge>,
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
            'v-toolbar-edge',
            `v-toolbar-edge--${edge.value}`,
            {
              [`v-toolbar-edge--empty`]: !hasChildren,
            },
          ]}>
          {children}
        </div>
      );
    };
  },
});
