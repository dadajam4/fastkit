import './VCardContent.scss';
import { defineComponent } from 'vue';

export const VCardContent = defineComponent({
  name: 'VCardContent',
  setup(_props, ctx) {
    return () => <div class="v-card-content">{ctx.slots.default?.()}</div>;
  },
});
