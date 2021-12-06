import './VCard.scss';
import { defineComponent, computed } from 'vue';
import { VPaper, createPaperProps } from '../VPaper';

export function createCardProps() {
  return {
    ...createPaperProps(),
  };
}

export const VCard = defineComponent({
  name: 'VCard',
  props: createCardProps(),
  setup(props, ctx) {
    const _props = computed(() => props);
    return () => {
      return <VPaper class="v-card" {..._props.value} v-slots={ctx.slots} />;
    };
  },
});
