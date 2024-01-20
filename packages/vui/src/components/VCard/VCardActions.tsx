import './VCardActions.scss';
import { defineComponent } from 'vue';

export const VCardActions = defineComponent({
  name: 'VCardActions',
  setup(_props, ctx) {
    return () => <div class="v-card-actions">{ctx.slots.default?.()}</div>;
  },
});
