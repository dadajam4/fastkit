import './VSkeltonLoaderBone.scss';

import { defineComponent } from 'vue';

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
          {ctx.slots.default?.()}
        </TagName>
      );
    };
  },
});
