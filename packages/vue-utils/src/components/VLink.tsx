import { defineComponent } from 'vue';
import {
  navigationableInheritProps,
  useNavigationable,
  renderSlotOrEmpty,
} from '../utils';

export const VLink = defineComponent({
  name: 'VLink',
  inheritAttrs: false,
  props: {
    ...navigationableInheritProps,
    clickableClassName: String,
  },
  setup(props, ctx) {
    const navigationable = useNavigationable(ctx, {
      clickableClassName: () => props.clickableClassName,
    });

    return () => {
      const { Tag, attrs } = navigationable.value;
      return (
        <Tag {...attrs} class="v-link">
          {renderSlotOrEmpty(ctx.slots)}
        </Tag>
      );
    };
  },
});
