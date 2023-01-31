import * as styles from './VAppLayout.css';
import { defineComponent, onBeforeUnmount } from 'vue';
import { defineSlotsProps } from '@fastkit/vue-utils';
import { VueAppLayout } from '../../controls';
import {
  VAL_POSITIONS,
  VueAppLayoutPositionY,
  VAL_BAR_TYPES,
} from '../../schemes';
import { ResizeDirectivePayload } from '@fastkit/vue-utils';
import { objectFromArray } from '@fastkit/helpers';
import { hasParentLayout, provideLayout } from './injections';
import { VAL_BOTTOM_ID } from '../../constants';
import { useRouter } from 'vue-router';

export const VAppLayout = defineComponent({
  name: 'VAppLayout',
  props: {
    ...defineSlotsProps<{
      default: VueAppLayout;
    }>(),
  },
  setup(props, ctx) {
    const layout = VueAppLayout.use();

    if (hasParentLayout()) {
      return () => {
        return <div>{ctx.slots.default?.(layout)}</div>;
      };
    }

    provideLayout();

    const { sideDetect } = styles;

    const sizeDetectHandlers = objectFromArray(VAL_POSITIONS, (position) => [
      position,
      (payload: ResizeDirectivePayload) => {
        layout.viewportRect[position] = payload.width;
      },
    ]);

    const router = useRouter();

    const removeRouterHook = router.afterEach(() => {
      layout.closeDrawer();
    });

    onBeforeUnmount(removeRouterHook);

    const renderBarSpacers = (y: VueAppLayoutPositionY) => {
      const barClasses = styles.barSpacers[y];
      return VAL_BAR_TYPES.map((bar) => (
        <div key={bar} class={barClasses[bar]} />
      ));
    };

    return () => {
      return (
        <div class={['VAppLayout', styles.host]}>
          {renderBarSpacers('top')}
          <div class={styles.inner}>
            <div class={styles.viewport}>{ctx.slots.default?.(layout)}</div>
            <div id={VAL_BOTTOM_ID} style={styles.viewportFooter} />
          </div>
          {renderBarSpacers('bottom')}
          <div class={sideDetect.wrapper}>
            {VAL_POSITIONS.map((position) => (
              <div
                class={sideDetect[position]}
                v-resize={sizeDetectHandlers[position]}
              />
            ))}
          </div>
        </div>
      );
    };
  },
});
