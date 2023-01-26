import * as styles from './VAppSystemBar.css';
import { defineComponent, PropType, computed, Teleport } from 'vue';
import { VueAppLayoutPositionY } from '../../schemes';
import { useVueAppLayout, VueAppBar } from '../../controls';
import { defineSlotsProps } from '@fastkit/vue-utils';

export const VAppSystemBar = defineComponent({
  name: 'VAppSystemBar',
  inheritAttrs: false,
  props: {
    position: String as PropType<VueAppLayoutPositionY>,
    ...defineSlotsProps<{
      default: VueAppBar;
    }>(),
  },
  setup(props, ctx) {
    const layout = useVueAppLayout();
    const bar = layout.launchBar(props);
    const staticStyles = ['VAppSystemBar', styles.host];
    const classesRef = computed(() => {
      const positionStyles = styles.positions[bar.position];
      const classes: (string | string[])[] = [
        staticStyles,
        positionStyles.host,
      ];
      return classes;
    });

    ctx.expose(bar);

    return () => {
      return (
        <Teleport to="body">
          <div class={classesRef.value} {...ctx.attrs}>
            {ctx.slots.default?.(bar)}
          </div>
        </Teleport>
      );
    };
  },
});
