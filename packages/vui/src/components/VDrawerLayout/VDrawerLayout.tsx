import './VDrawerLayout.scss';
import { defineComponent, computed } from 'vue';
import { createPaperBaseProps, VPaper } from '../VPaper';

export const VDrawerLayout = defineComponent({
  name: 'VDrawerLayout',
  props: {
    ...createPaperBaseProps(),
  },
  setup(props, ctx) {
    return () => {
      const paperProps = computed(() => ({
        color: props.color,
        tag: props.tag,
      }));

      return (
        <VPaper
          class="v-drawer-layout"
          innerClass="v-drawer-layout__inner"
          {...paperProps.value}
          square
          headerProps={{
            class: 'v-drawer-layout__header',
          }}
          bodyProps={{
            class: 'v-drawer-layout__body',
          }}
          footerProps={{
            class: 'v-drawer-layout__footer',
          }}
          v-slots={ctx.slots}></VPaper>
      );
    };
  },
});
