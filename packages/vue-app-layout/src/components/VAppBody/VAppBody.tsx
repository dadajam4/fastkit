import * as styles from './VAppBody.css';
import { defineComponent } from 'vue';

export const VAppBody = defineComponent({
  name: 'VAppBody',
  props: {
    center: Boolean,
  },
  setup(props, ctx) {
    return () => {
      return (
        <div class={['VAppBody', styles.host, props.center && styles.isCenter]}>
          {ctx.slots.default?.()}
        </div>
      );
    };
  },
});
