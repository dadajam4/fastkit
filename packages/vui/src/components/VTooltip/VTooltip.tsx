import './VTooltip.scss';

import { defineComponent } from 'vue';
import { VMenu } from '../VMenu';

export const VTooltip = defineComponent({
  name: 'VTooltip',
  inheritAttrs: false,
  setup(_props, ctx) {
    return () => {
      const attrs = {
        ...ctx.attrs,
      };

      const defaultSlot = ctx.slots.default;
      if (attrs.openOnHover == null) {
        attrs.openOnHover = true;
      }
      if (attrs.openDelay == null) {
        attrs.openDelay = 200;
      }
      if (attrs.hideOnScroll == null) {
        attrs.hideOnScroll = true;
      }

      return (
        <VMenu
          {...attrs}
          scrollLock={false}
          class="v-tooltip"
          v-slots={{
            ...ctx.slots,
            default: (payload) => [
              <span class="v-tooltip__inner">{defaultSlot?.(payload)}</span>,
            ],
          }}
        />
      );
    };
  },
}) as typeof VMenu;
