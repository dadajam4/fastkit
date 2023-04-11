import './VGridContainer.scss';

import { defineComponent, computed } from 'vue';
import { htmlAttributesPropOptions } from '@fastkit/vue-utils';
import { RawGridValueProp, extractRawGridValueClasses } from './schemes';

export type GridContainerSpacingValue =
  | 0
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 4.5
  | 5
  | 5.5
  | 6
  | 6.5
  | 7
  | 7.5
  | 8
  | 8.5
  | 9
  | 9.5
  | 10;

function spacingValueToString(value: GridContainerSpacingValue): string {
  return Number.isInteger(value) ? String(value) : `${value}h`;
}

export type GridContainerDirectionValue =
  | 'row'
  | 'row-reverse'
  | 'column'
  | 'column-reverse';

export type GridContainerWrapValue = 'wrap' | 'nowrap' | 'wrap-reverse';

export type GridContainerAlignContentValue =
  | 'flex-start'
  | 'flex-end'
  | 'start'
  | 'end'
  | 'stretch'
  | 'baseline'
  | 'center'
  | 'self-start'
  | 'self-end';

export type GridContainerJustifyContentValue =
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';

export const VGridContainer = defineComponent({
  name: 'VGridContainer',
  inheritAttrs: false,
  props: {
    ...htmlAttributesPropOptions,
    wrapperTag: {
      type: String,
      default: 'div',
    },
    tag: {
      type: String,
      default: 'div',
    },
    spacing:
      undefined as unknown as RawGridValueProp<GridContainerSpacingValue>,
    spacingX:
      undefined as unknown as RawGridValueProp<GridContainerSpacingValue>,
    spacingY:
      undefined as unknown as RawGridValueProp<GridContainerSpacingValue>,
    direction:
      undefined as unknown as RawGridValueProp<GridContainerDirectionValue>,
    wrap: undefined as unknown as RawGridValueProp<GridContainerWrapValue>,
    alignContent:
      undefined as unknown as RawGridValueProp<GridContainerAlignContentValue>,
    justifyContent:
      undefined as unknown as RawGridValueProp<GridContainerJustifyContentValue>,
  },
  setup(props, ctx) {
    const data = computed(() => {
      const classes: any[] = [];

      const attrs = {
        ...ctx.attrs,
      };

      const {
        spacing,
        spacingX,
        spacingY,
        direction,
        wrap,
        alignContent,
        justifyContent,
      } = props;
      const wrapperClass = attrs.class;
      const wrapperStyle = attrs.style as any;

      delete attrs.class;
      delete attrs.style;
      delete attrs.spacing;
      delete attrs.spacingX;
      delete attrs.spacingY;
      delete attrs.direction;
      delete attrs.wrap;
      delete attrs.alignContent;
      delete attrs.justifyContent;

      // spacingX = mergeSpacing(spacing, spacingX);
      // spacingY = mergeSpacing(spacing, spacingY);
      // if (!spacingX) {
      //   spacingX = spacing;
      // }

      // align &&
      //   classes.push(extractRawGridItemValueClasses(align, 'self-align-'));
      // justify &&
      //   classes.push(extractRawGridItemValueClasses(justify, 'self-justify-'));
      spacing != null &&
        classes.push(
          extractRawGridValueClasses(
            spacing,
            'grid-spacing-',
            spacingValueToString,
          ),
        );
      spacingX != null &&
        classes.push(
          extractRawGridValueClasses(
            spacingX,
            'grid-spacing-x-',
            spacingValueToString,
          ),
        );
      spacingY != null &&
        classes.push(
          extractRawGridValueClasses(
            spacingY,
            'grid-spacing-y-',
            spacingValueToString,
          ),
        );

      direction &&
        classes.push(extractRawGridValueClasses(direction, 'direction-'));
      wrap && classes.push(extractRawGridValueClasses(wrap, ''));
      alignContent &&
        classes.push(extractRawGridValueClasses(alignContent, 'align-'));
      justifyContent &&
        classes.push(extractRawGridValueClasses(justifyContent, 'justify-'));

      return {
        wrapperClass,
        wrapperStyle,
        classes,
        attrs,
      };
    });

    return () => {
      const WrapperTag = props.wrapperTag as 'div';
      const TagName = props.tag as 'div';
      const { wrapperClass, wrapperStyle, classes, attrs } = data.value;

      return (
        <WrapperTag
          class={['v-grid-container-wrapper', wrapperClass]}
          style={wrapperStyle}>
          <TagName
            class={['v-grid-container grid-container', classes]}
            {...attrs}
            v-slots={ctx.slots}
          />
        </WrapperTag>
      );
    };
  },
});
