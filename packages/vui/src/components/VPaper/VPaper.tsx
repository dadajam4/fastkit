import './VPaper.scss';
import { defineComponent, computed, PropType, VNodeProps } from 'vue';
import { createElevationProps, useElevation } from '../../composables';
import { renderSlotOrEmpty, defineSlotsProps } from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export function createPaperBaseProps() {
  return {
    color: String as PropType<ScopeName>,
    tag: {
      type: String,
      default: 'div',
    },
    ...defineSlotsProps<{
      header: void;
      default: void;
      footer: void;
    }>(),
  };
}

type ARGS = Record<string, unknown> & VNodeProps;

export function createPaperProps() {
  return {
    ...createElevationProps(),
    ...createPaperBaseProps(),
    square: Boolean,
    headerProps: Object as PropType<ARGS>,
    bodyProps: Object as PropType<ARGS>,
    footerProps: Object as PropType<ARGS>,
  };
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
    const headerProps = computed<any>(() => props.headerProps);
    const bodyProps = computed<any>(() => props.bodyProps);
    const footerProps = computed<any>(() => props.footerProps);

    return () => {
      const TagName = tag.value as 'div';
      const header = renderSlotOrEmpty(ctx.slots, 'header');
      const footer = renderSlotOrEmpty(ctx.slots, 'footer');
      return (
        <TagName class={['v-paper', classes.value]}>
          {header && (
            <div class="v-paper__header" {...headerProps.value}>
              {header}
            </div>
          )}
          <div class="v-paper__body" {...bodyProps.value}>
            {renderSlotOrEmpty(ctx.slots, 'default')}
          </div>
          {footer && (
            <div class="v-paper__footer" {...footerProps.value}>
              {footer}
            </div>
          )}
        </TagName>
      );
    };
  },
});
