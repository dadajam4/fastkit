import './VNavigationItem.scss';
import { defineComponent, computed } from 'vue';
import { createListTileProps, listTileEmits, VListTile } from '../VListTile';
import { ExtractPropInput, renderSlotOrEmpty } from '@fastkit/vue-utils';

export function createNavigationItemProps() {
  return {
    ...createListTileProps(),
  };
}

export type NavigationItemInput = ExtractPropInput<
  ReturnType<typeof createNavigationItemProps>
>;

export const VNavigationItem = defineComponent({
  name: 'VNavigationItem',
  props: createNavigationItemProps(),
  emits: {
    ...listTileEmits,
  },
  setup(props, ctx) {
    const _props = computed(() => ({ ...props }));
    return () => {
      return (
        <VListTile {..._props.value} class="v-navigation-item">
          {renderSlotOrEmpty(ctx.slots, 'default')}
        </VListTile>
      );
    };
  },
});
