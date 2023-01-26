import * as styles from './VAppLayout.css';
import { defineComponent } from 'vue';
import { defineSlotsProps } from '@fastkit/vue-utils';
import { VueAppLayout } from '../../controls';
import { VAL_POSITIONS } from '../../schemes';
import { ResizeDirectivePayload } from '@fastkit/vue-utils';
import { objectFromArray } from '@fastkit/helpers';
import { hasParentLayout, provideLayout } from './injections';
import { VAL_BOTTOM_ID } from '../../constants';

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

    return () => {
      return (
        <div class={['VAppLayout', styles.host]}>
          <div class={styles.viewport}>{ctx.slots.default?.(layout)}</div>
          <div id={VAL_BOTTOM_ID} style={styles.viewportFooter} />
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
