import './VPaper.scss';
import { defineComponent, computed, PropType, VNodeProps } from 'vue';
import { createElevationProps, useElevation } from '../../composables';
import {
  renderSlotOrEmpty,
  defineSlotsProps,
  htmlAttributesPropOptions,
} from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export function createPaperBaseProps() {
  return {
    ...htmlAttributesPropOptions,
    color: String as PropType<ScopeName>,
    tag: {
      type: [String, Object] as PropType<any>,
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
    innerClass: [String, Array, Object] as PropType<any>,
  };
}

export const VPaper = defineComponent({
  name: 'VPaper',
  inheritAttrs: false,
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
        'v-paper--has-color': !!scope.value.value || !!ctx.attrs.disabled,
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
        <TagName class={['v-paper', classes.value]} {...ctx.attrs}>
          <div class={['v-paper__inner', props.innerClass]}>
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
          </div>
        </TagName>
      );
    };
  },
});
