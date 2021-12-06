import './VPaper.scss';
import { defineComponent, computed } from 'vue';
import { createElevationProps, useElevation } from '../../composables';
import { renderSlotOrEmpty, defineSlotsProps } from '@fastkit/vue-utils';

export function createPaperProps() {
  return {
    ...createElevationProps(),
    square: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
    ...defineSlotsProps<{
      header: void;
      footer: void;
    }>(),
  };
  //
}

export const VPaper = defineComponent({
  name: 'VPaper',
  props: createPaperProps(),
  setup(props, ctx) {
    const tag = computed(() => props.tag);
    const elevation = useElevation(props, { defaultValue: 1 });

    return () => {
      const TagName = tag.value as 'div';
      const header = renderSlotOrEmpty(ctx.slots, 'header');
      const footer = renderSlotOrEmpty(ctx.slots, 'footer');
      return (
        <TagName class={['v-paper', elevation.elevationClassName.value]}>
          {header && <div class="v-paper__header">{header}</div>}
          <div class="v-paper__body">
            {renderSlotOrEmpty(ctx.slots, 'default')}
          </div>
          {footer && <div class="v-paper__footer">{footer}</div>}
        </TagName>
      );
    };
  },
});
