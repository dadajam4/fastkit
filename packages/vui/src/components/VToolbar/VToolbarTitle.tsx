import './VToolbarTitle.scss';
import { defineComponent, computed } from 'vue';
import { defineSlots } from '@fastkit/vue-utils';

const slots = defineSlots<{
  default?: () => any;
}>();

export const VToolbarTitle = defineComponent({
  name: 'VToolbarTitle',
  props: {
    tag: {
      type: String,
      default: 'span',
    },
    ...slots(),
  },
  slots,
  setup(props, ctx) {
    const _TagName = computed(() => props.tag);
    return () => {
      const TagName = _TagName.value as 'span';

      return <TagName class="v-toolbar-title">{ctx.slots.default?.()}</TagName>;
    };
  },
});
