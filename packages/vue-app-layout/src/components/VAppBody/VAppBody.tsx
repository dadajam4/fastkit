import { defineComponent } from 'vue';
import * as styles from './VAppBody.css';

export const VAppBody = defineComponent({
  name: 'VAppBody',
  props: {
    center: Boolean,
  },
  setup(props, ctx) {
    return () => (
      <div class={['VAppBody', styles.host, props.center && styles.isCenter]}>
        {ctx.slots.default?.()}
      </div>
    );
  },
});
