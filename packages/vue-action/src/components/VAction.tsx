import { defineComponent } from 'vue';
import { useActionable } from '../actionable';
import { actionableInheritProps } from '../schemes';

export const VAction = defineComponent({
  name: 'VAction',
  inheritAttrs: false,
  props: {
    ...actionableInheritProps,
    clickableClassName: String,
  },
  setup(props, ctx) {
    const actionable = useActionable(ctx, {
      clickableClassName: () => props.clickableClassName,
    });

    return () => {
      const { Tag, attrs } = actionable.value;
      return (
        <Tag {...attrs} class="v-action">
          {ctx.slots.default?.()}
        </Tag>
      );
    };
  },
});
