import * as styles from './VAppBottom.css';
import { defineComponent, Teleport } from 'vue';
import { VAL_BOTTOM_ID } from '../../constants';
import { ClientOnly } from '@fastkit/vue-utils';

export const VAppBottom = defineComponent({
  name: 'VAppBottom',
  inheritAttrs: false,
  props: {
    lazy: Boolean,
  },
  setup(props, ctx) {
    return () => {
      const node = (
        <Teleport to={`#${VAL_BOTTOM_ID}`}>
          <div class={['VAppBottom', styles.host]} {...ctx.attrs}>
            {ctx.slots.default?.()}
          </div>
        </Teleport>
      );

      return props.lazy ? <ClientOnly>{node}</ClientOnly> : node;
    };
  },
});
