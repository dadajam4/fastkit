import './VSkeltonLoaderBone.scss';

import { defineComponent } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export const VSkeltonLoaderBone = defineComponent({
  name: 'VSkeltonLoaderBone',
  inheritAttrs: false,
  props: {
    tag: {
      type: String,
      default: 'div',
    },
  },
  setup(props, ctx) {
    return () => {
      const TagName = props.tag as 'div';
      return (
        <TagName {...ctx.attrs} class="v-skelton-loader-bone">
          {renderSlotOrEmpty(ctx.slots)}
        </TagName>
      );
    };
  },
});
