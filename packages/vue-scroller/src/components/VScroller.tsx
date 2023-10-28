import './VScroller.scss';

import { defineComponent, PropType, ExtractPropTypes, computed } from 'vue';
import {
  useScrollerControl,
  UseScrollerSetting,
  ScrollerControl,
} from '../composables';
import { ExtractPropInput, defineTypedComponent } from '@fastkit/vue-utils';

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

/** Scrollability in each direction */
export interface ScrollerScrollability {
  /** Whether you can scroll to the left or not */
  left: boolean;
  /** Whether you can scroll to the right or not */
  right: boolean;
  /** Whether you can scroll to the top or not */
  top: boolean;
  /** Whether you can scroll to the bottom or not */
  bottom: boolean;
}

/**
 * Combined Scrollability
 *
 * The information immediately below is marked as scrollable to account for the margin of the `guide` prop, so `false` may be marked even if the information is actually scrollable.
 * If you want to check strict scrollability, check the `strict` property.
 */
export interface ScrollerCombinedScrollability extends ScrollerScrollability {
  /**
   * Strict scrollability
   *
   * Scrollable more than 0px will be marked as valid
   */
  strict: ScrollerScrollability;
}

export interface ScrollerAPI {
  get scroller(): ScrollerControl;
  /**
   * Combined Scrollability
   *
   * @see {@link ScrollerCombinedScrollability}
   */
  get scrollable(): ScrollerCombinedScrollability;
}

export const _ScrollerI = defineComponent({
  name: 'VScroller',
  props: scrollerProps,
  setup(props, ctx) {
    const settings = props.settings || {};
    const scroller = useScrollerControl({
      ...settings,
      el: settings.el || 'self',
    });

    const guideOffsetRef = computed(() => {
      const { guide } = props;
      if (typeof guide === 'number') return guide;
      if (guide === true) return DEFAULT_GUIDE_OFFSET;
      return undefined;
    });

    const scrollability = computed<ScrollerCombinedScrollability>(() => {
      const guideOffset = guideOffsetRef.value || DEFAULT_GUIDE_OFFSET;
      const { scrollLeft, scrollTop, scrollRight, scrollBottom } = scroller;
      return {
        left: scrollLeft >= guideOffset,
        right: scrollRight >= guideOffset,
        top: scrollTop >= guideOffset,
        bottom: scrollBottom >= guideOffset,
        strict: {
          left: scrollLeft > 0,
          right: scrollRight > 0,
          top: scrollTop > 0,
          bottom: scrollBottom > 0,
        },
      };
    });

    const scrollerRef: ScrollerAPI = {
      scroller,
      get scrollable() {
        return scrollability.value;
      },
    };

    const guidesRef = computed<VScrollerGuideType[] | undefined>(() => {
      const guideOffset = guideOffsetRef.value;
      if (guideOffset === undefined) return;

      const guides: VScrollerGuideType[] = [];

      const scrollable = scrollability.value;

      scrollable.left && guides.push('left');
      scrollable.top && guides.push('top');
      scrollable.right && guides.push('right');
      scrollable.bottom && guides.push('bottom');

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
            {ctx.slots.default?.()}
          </div>
          {$guides}
        </div>
      );
    };
  },
});

export const VScroller =
  defineTypedComponent(_ScrollerI).$expose<ScrollerAPI>();
