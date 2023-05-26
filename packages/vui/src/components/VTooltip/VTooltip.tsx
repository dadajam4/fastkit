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

      return (
        <VMenu
          {...attrs}
          scrollLock={false}
          class="v-tooltip"
          v-slots={{
            ...ctx.slots,
            default: (payload) => {
              return [
                <span class="v-tooltip__inner">
                  {defaultSlot && defaultSlot(payload)}
                </span>,
              ];
            },
          }}
        />
      );
    };
  },
}) as typeof VMenu;
