import './VGridItem.scss';

import { defineComponent, computed } from 'vue';
// import { MediaMatchKey, MEDIA_MATCH_CONDITIONS } from '@fastkit/media-match';
import { htmlAttributesPropOptions } from '@fastkit/vue-utils';
import { RawGridValueProp, extractRawGridValueClasses } from './schemes';

export type GridItemNumberSizeValue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export type GridItemSizeValue = GridItemNumberSizeValue | 'auto';

// type MQSizeProps = Record<
//   MediaMatchKey,
//   PropType<GridItemSizeValue | undefined>
// >;

export type GridItemAlignValue =
  | 'flex-start'
  | 'flex-end'
  | 'start'
  | 'end'
  | 'stretch'
  | 'baseline'
  | 'center'
  | 'self-start'
  | 'self-end';

export type GridItemJustifyValue =
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'baseline'
  | 'stretch';

export const VGridItem = defineComponent({
  name: 'VGridItem',
  inheritAttrs: false,
  props: {
    ...htmlAttributesPropOptions,
    tag: {
      type: String,
      default: 'div',
    },
    // ...(undefined as unknown as MQSizeProps),
    size: undefined as unknown as RawGridValueProp<GridItemSizeValue>,
    align: undefined as unknown as RawGridValueProp<GridItemAlignValue>,
    justify: undefined as unknown as RawGridValueProp<GridItemJustifyValue>,
    order: undefined as unknown as RawGridValueProp<number | string>,
  },
  setup(props, ctx) {
    const data = computed(() => {
      const classes: any[] = [];

      const attrs = {
        ...ctx.attrs,
      };

      const { size, align, justify, order } = props;

      delete attrs.size;
      delete attrs.align;
      delete attrs.justify;
      delete attrs.order;

      size != null &&
        classes.push(extractRawGridValueClasses(size, 'grid-size-'));
      align && classes.push(extractRawGridValueClasses(align, 'self-align-'));
      justify &&
        classes.push(extractRawGridValueClasses(justify, 'self-justify-'));
      order != null &&
        classes.push(extractRawGridValueClasses(order, 'order-'));

      // MEDIA_MATCH_CONDITIONS.forEach(({ key }) => {
      //   const v = attrs[key];
      //   delete attrs[key];
      //   if (v != null) {
      //     classes.push(`grid-size-${v}--${key}`);
      //   }
      // });

      return {
        classes,
        attrs,
      };
    });

    return () => {
      const TagName = props.tag as 'div';
      const { classes, attrs } = data.value;

      return (
        <TagName
          class={['v-grid-item grid-item', classes]}
          {...attrs}
          v-slots={ctx.slots}
        />
      );
    };
  },
});
