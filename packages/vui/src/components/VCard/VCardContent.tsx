import './VCardContent.scss';
import { defineComponent } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export const VCardContent = defineComponent({
  name: 'VCardContent',
  setup(props, ctx) {
    return () => {
      return (
        <div class="v-card-content">
          {renderSlotOrEmpty(ctx.slots, 'default')}
        </div>
      );
    };
  },
});
