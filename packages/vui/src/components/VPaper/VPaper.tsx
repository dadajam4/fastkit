import './VPaper.scss';
import { defineComponent, computed, PropType } from 'vue';
import { createElevationProps, useElevation } from '../../composables';
import { renderSlotOrEmpty, defineSlotsProps } from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export function createPaperProps() {
  return {
    ...createElevationProps(),
    square: Boolean,
    color: String as PropType<ScopeName>,
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
    const scope = useScopeColorClass(props);
    const classes = computed(() => [
      elevation.elevationClassName.value,
      scope.value.className,
      {
        'v-paper--plain': !scope.value.value,
        'v-paper--has-color': !!scope.value.value,
        'v-paper--square': props.square,
      },
    ]);

    return () => {
      const TagName = tag.value as 'div';
      const header = renderSlotOrEmpty(ctx.slots, 'header');
      const footer = renderSlotOrEmpty(ctx.slots, 'footer');
      return (
        <TagName class={['v-paper', classes.value]}>
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
