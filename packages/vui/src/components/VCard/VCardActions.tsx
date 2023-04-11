import './VCardActions.scss';
import { defineComponent } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export const VCardActions = defineComponent({
  name: 'VCardActions',
  setup(props, ctx) {
    return () => {
      return (
        <div class="v-card-actions">
          {renderSlotOrEmpty(ctx.slots, 'default')}
        </div>
      );
    };
  },
});
