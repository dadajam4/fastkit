import './VToolbarTitle.scss';
import { defineComponent, computed } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export const VToolbarTitle = defineComponent({
  name: 'VToolbarTitle',
  props: {
    tag: {
      type: String,
      default: 'span',
    },
  },
  setup(props, ctx) {
    const _TagName = computed(() => props.tag);
    return () => {
      const TagName = _TagName.value as 'span';

      return (
        <TagName class="v-toolbar-title">
          {renderSlotOrEmpty(ctx.slots, 'default')}
        </TagName>
      );
    };
  },
});
