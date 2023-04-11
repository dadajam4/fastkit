import './VScroller.scss';

import {
  defineComponent,
  PropType,
  ExtractPropTypes,
  computed,
  ref,
  Ref,
} from 'vue';
import {
  useScrollerControl,
  UseScrollerSetting,
  ScrollerControl,
} from '../composables';
import { ExtractPropInput, renderSlotOrEmpty } from '@fastkit/vue-utils';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VScrollerSettings extends UseScrollerSetting {}

const DEFAULT_GUIDE_OFFSET = 20;

const GuideTypes = ['top', 'right', 'bottom', 'left'] as const;

type VScrollerGuideType = (typeof GuideTypes)[number];

export const scrollerProps = {
  settings: {
    type: Object as PropType<VScrollerSettings | null>,
    default: null,
  },
  /**
   * スクロール可能な辺にガイドとして影を表示する場合に設定する
   */
  guide: [Boolean, Number],

  /**
   * スクロールするコンテナ要素のクラス名
   */
  containerClass: String,
};

export type VScrollerProps = ExtractPropInput<typeof scrollerProps>;

export type VScrollerResolvedProps = ExtractPropTypes<typeof scrollerProps>;

export interface VScrollerRef {
  scroller: ScrollerControl;
}

export function useVScrollerRef(): Ref<VScrollerRef | null> {
  return ref(null);
}

export const VScroller = defineComponent({
  name: 'VScroller',
  props: scrollerProps,
  setup(props, ctx) {
    const settings = props.settings || {};
    const scroller = useScrollerControl({
      ...settings,
      el: settings.el || 'self',
    });

    const scrollerRef: VScrollerRef = {
      scroller,
    };

    const guideOffsetRef = computed(() => {
      const { guide } = props;
      if (typeof guide === 'number') return guide;
      if (guide === true) return DEFAULT_GUIDE_OFFSET;
      return undefined;
    });

    const guidesRef = computed<VScrollerGuideType[] | undefined>(() => {
      const guideOffset = guideOffsetRef.value;
      if (guideOffset === undefined) return;

      const guides: VScrollerGuideType[] = [];

      const { scrollLeft, scrollTop, scrollRight, scrollBottom } = scroller;

      if (scrollLeft >= guideOffset) guides.push('left');
      if (scrollTop >= guideOffset) guides.push('top');
      if (scrollRight >= guideOffset) guides.push('right');
      if (scrollBottom >= guideOffset) guides.push('bottom');

      return guides;
    });

    ctx.expose(scrollerRef);

    return () => {
      const guides = guidesRef.value;
      const { containerClass } = props;
      const $guides =
        guides &&
        GuideTypes.map((type) => {
          return (
            <div
              class={[
                'v-scroller__guide',
                {
                  [`v-scroller__guide--${type}`]: true,
                  [`v-scroller__guide--active`]: guides.includes(type),
                },
              ]}
              key={type}
            />
          );
        });

      return (
        <div class="v-scroller">
          <div
            class={['v-scroller__container', containerClass]}
            ref={scroller.elementRef}>
            {renderSlotOrEmpty(ctx.slots, 'default')}
          </div>
          {$guides}
        </div>
      );
    };
  },
});
