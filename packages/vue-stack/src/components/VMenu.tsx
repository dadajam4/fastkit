import './VMenu.scss';
import {
  defineComponent,
  ExtractPropTypes,
  computed,
  PropType,
  reactive,
  CSSProperties,
  withDirectives,
  ref,
} from 'vue';
import {
  createStackableDefine,
  createStackActionProps,
  VMenuRect,
  VMenuState,
  VMenuControl,
} from '../schemes';
import { useStackControl } from '../composables';
import {
  ExtractPropInput,
  useWindow,
  resizeDirectiveArgument,
  ResizeDirectivePayload,
} from '@fastkit/vue-utils';
import { logger } from '../logger';
import { IN_WINDOW } from '@fastkit/helpers';

const DEFAULT_EDGE_MARGIN = 20;
const DEFAULT_DISTANCE = 10;
const DEFAULT_RESIZE_WATCH_DEBOUNCE = 250;
const DEFAULT_TRANSITION = 'v-menu-auto';

const { props, emits } = createStackableDefine({
  defaultTransition: DEFAULT_TRANSITION,
  defaultScrollLock: true,
});

export const stackMenuProps = {
  ...props,
  ...createStackActionProps(),
  x: String as PropType<VMenuXPosition>,
  y: String as PropType<VMenuYPosition>,
  allowOverflow: Boolean,
  width: [Number, String] as PropType<number | 'fit'>,
  height: [Number, String] as PropType<number | 'fit'>,
  maxWidth: [Number, String] as PropType<number | 'fit' | 'free'>,
  maxHeight: [Number, String] as PropType<number | 'fit' | 'free'>,
  distance: {
    type: Number,
    default: DEFAULT_DISTANCE,
  },
  edgeMargin: {
    type: Number,
    default: DEFAULT_EDGE_MARGIN,
  },
  resizeWatchDebounce: {
    type: Number,
    default: DEFAULT_RESIZE_WATCH_DEBOUNCE,
  },
  overlap: Boolean,
};

export const stackMenuEmits = {
  ...emits,
};

export type VMenuXPosition =
  | 'left'
  | 'left-inner'
  | 'center'
  | 'right'
  | 'right-inner';

export type VMenuYPosition =
  | 'top'
  | 'top-inner'
  | 'center'
  | 'bottom'
  | 'bottom-inner';

export type VMenuProps = ExtractPropInput<typeof stackMenuProps>;

export type VMenuResolvedProps = ExtractPropTypes<typeof stackMenuProps>;

export const VMenu = defineComponent({
  name: 'VMenu',
  inheritAttrs: false,
  props: stackMenuProps,
  emits: stackMenuEmits,
  setup(props, ctx) {
    const stackControl = useStackControl(props, ctx as any, {
      onContentMounted: () => {
        updateRects();
        // startHandleResize();
      },
      // onContentDetached: stopHandleResize,
      transitionResolver,
    });

    const state: VMenuState = reactive({
      pageXOffset: 0,
      pageYOffset: 0,
      rect: null,
      activatorRect: null,
    });

    const _scrollerRef = ref<HTMLElement | null>(null);
    const _bodyRef = ref<HTMLElement | null>(null);
    const _distance = computed(() => props.distance);
    const _resizeWatchDebounce = computed(() => props.resizeWatchDebounce);
    const $window = useWindow();

    const _overlap = computed(() => props.overlap);
    const _edgeMargin = computed(() => props.edgeMargin);
    const _minLeft = computed(() => _edgeMargin.value + state.pageXOffset);
    const _minTop = computed(() => _edgeMargin.value + state.pageYOffset);
    const _maxRight = computed(
      () => $window.width - _edgeMargin.value + state.pageXOffset,
    );
    const _maxBottom = computed(
      () => $window.height - _edgeMargin.value + state.pageYOffset,
    );
    const _width = computed(() => props.width);
    const _height = computed(() => props.height);
    const _maxWidth = computed(() => props.maxWidth);
    const _maxHeight = computed(() => props.maxHeight);

    const _positionFlags = computed(() => {
      const { x = 'center', y = 'bottom' } = props;
      // let { y } = props;
      // if (!x && !y) {
      //   y = 'bottom';
      // }

      return {
        x,
        y,
        xInner: x === 'left-inner' || x === 'right-inner',
        yInner: y === 'top-inner' || y === 'bottom-inner',
        left: x === 'left' || x === 'left-inner',
        right: x === 'right' || x === 'right-inner',
        top: y === 'top' || y === 'top-inner',
        bottom: y === 'bottom' || y === 'bottom-inner',
      };
    });

    function transitionResolver() {
      return _transition.value;
    }
    const _transition = computed(() => {
      const { transition } = props;
      if (typeof transition === 'string' && transition !== DEFAULT_TRANSITION)
        return transition;
      const { x, y } = _positionFlags.value;
      if (y === 'top') return 'v-stack-slide-y-reverse';
      if (y === 'bottom') return 'v-stack-slide-y';
      if (x === 'left') return 'v-stack-slide-x-reverse';
      if (x === 'right') return 'v-stack-slide-x';
      if (y === 'top-inner') return 'v-stack-slide-y';
      if (y === 'bottom-inner') return 'v-stack-slide-y-reverse';
      if (x === 'left-inner') return 'v-stack-slide-x';
      if (x === 'right-inner') return 'v-stack-slide-x-reverse';
      return 'v-stack-scale';
    });

    const _rect = computed<VMenuRect | null>(() => {
      const { rect, activatorRect } = state;
      if (!rect) return null;
      if (!activatorRect) return null;

      const { allowOverflow } = props;
      const { pageXOffset, pageYOffset } = state;
      const minLeft = _minLeft.value;
      const minTop = _minTop.value;
      const maxRight = _maxRight.value;
      const maxBottom = _maxBottom.value;
      const distance = _distance.value;
      const overlap = _overlap.value;

      let computedWidth = _width.value;
      let computedHeight = _height.value;
      let computedMaxWidth = _maxWidth.value;
      let computedMaxHeight = _maxHeight.value;

      let left: number, top: number, width: number, height: number;

      const { width: myWidth, height: myHeight } = rect;

      const {
        top: activatorTop,
        left: activatorLeft,
        right: activatorRight,
        bottom: activatorBottom,
        width: activatorWidth,
        height: activatorHeight,
      } = activatorRect;

      if (computedWidth === 'fit')
        computedWidth = Math.max(activatorWidth, myWidth);
      if (computedHeight === 'fit')
        computedHeight = Math.max(activatorHeight, myHeight);
      if (computedMaxWidth === 'fit') computedMaxWidth = activatorWidth;
      if (computedMaxHeight === 'fit') computedMaxHeight = activatorHeight;

      let {
        top: isTop,
        bottom: isBottom,
        left: isLeft,
        right: isRight,
      } = _positionFlags.value;

      const { xInner, yInner } = _positionFlags.value;

      width = typeof computedWidth === 'number' ? computedWidth : myWidth;
      height = typeof computedHeight === 'number' ? computedHeight : myHeight;

      const overlapHeight = overlap ? activatorHeight : 0;
      const overlapWidth = overlap ? activatorWidth : 0;
      const topFree = activatorTop - _edgeMargin.value + overlapHeight;
      const bottomFree =
        $window.height - _edgeMargin.value - activatorBottom + overlapHeight;
      const leftFree = activatorLeft - _edgeMargin.value + overlapWidth;
      const rightFree =
        $window.width - _edgeMargin.value - activatorRight + overlapWidth;

      if (!yInner && computedMaxHeight == null) {
        if (isBottom) {
          if (height > bottomFree) {
            if (bottomFree < topFree) {
              isBottom = false;
              isTop = true;
              computedMaxHeight = topFree;
            } else {
              computedMaxHeight = bottomFree;
            }
          }
        } else if (isTop) {
          if (height > topFree) {
            if (topFree < bottomFree) {
              isTop = false;
              isBottom = true;
              computedMaxHeight = bottomFree;
            } else {
              computedMaxHeight = topFree;
            }
          }
        }
      }

      if (!xInner && computedMaxWidth == null) {
        if (isRight) {
          if (width > rightFree) {
            if (rightFree < leftFree) {
              isRight = false;
              isLeft = true;
              computedMaxWidth = leftFree;
            } else {
              computedMaxWidth = rightFree;
            }
          }
        } else if (isLeft) {
          if (width > leftFree) {
            if (leftFree < rightFree) {
              isLeft = false;
              isRight = true;
              computedMaxWidth = rightFree;
            } else {
              computedMaxWidth = leftFree;
            }
          }
        }
      }

      if (typeof computedMaxWidth === 'number' && width > computedMaxWidth) {
        width = computedMaxWidth;
      }
      if (typeof computedMaxHeight === 'number' && height > computedMaxHeight) {
        height = computedMaxHeight;
      }

      if (isTop) {
        if (yInner) {
          top = activatorTop;
        } else {
          top = activatorTop - height;
          if (overlap) top += activatorHeight;
        }
      } else if (isBottom) {
        if (yInner) {
          top = activatorBottom - height;
        } else {
          top = activatorBottom;
          if (overlap) top -= activatorHeight;
        }
      } else {
        top = activatorTop - (height - activatorHeight) / 2;
      }

      top += pageYOffset;

      if (isLeft) {
        if (xInner) {
          left = activatorLeft;
        } else {
          left = activatorLeft - width;
          if (overlap) left += activatorWidth;
        }
      } else if (isRight) {
        if (xInner) {
          left = activatorRight - width;
        } else {
          left = activatorRight;
          if (overlap) left -= activatorWidth;
        }
      } else {
        left = activatorLeft - (width - activatorWidth) / 2;
      }

      left += pageXOffset;

      if (!overlap) {
        if (isBottom) {
          top += distance;
        } else if (isTop) {
          top -= distance;
        }

        if (isRight) {
          left += distance;
        } else if (isLeft) {
          left -= distance;
        }
      }

      let right = left + width;
      let bottom = top + height;

      const rightDiff = right - maxRight;
      if (rightDiff > 0) {
        left -= rightDiff;
        right -= rightDiff;
      }

      const bottomDiff = bottom - maxBottom;
      if (bottomDiff > 0) {
        top -= bottomDiff;
        bottom -= bottomDiff;
      }

      const leftDiff = minLeft - left;
      if (leftDiff > 0) {
        left += leftDiff;
        right += leftDiff;
      }

      const topDiff = minTop - top;
      if (topDiff > 0) {
        top += topDiff;
        bottom += topDiff;
      }

      if (!allowOverflow) {
        const overflowX = right - maxRight;
        if (overflowX > 0) {
          width -= overflowX;
          right -= overflowX;
        }
        const overflowY = bottom - maxBottom;
        if (overflowY > 0) {
          height -= overflowY;
          bottom -= overflowY;
        }
      }

      return {
        left,
        right,
        top,
        bottom,
        width,
        height,
      };
    });

    const _styles = computed<CSSProperties>(() => {
      const styles: CSSProperties = {
        position: 'absolute',
      };
      const rect = _rect.value;
      if (rect) {
        styles.left = rect.left + 'px';
        styles.top = rect.top + 'px';
        styles.width = rect.width + 'px';
        styles.height = rect.height + 'px';
      } else {
        styles.visibility = 'hidden';
      }
      return styles;
    });

    function updatePageOffset() {
      if (!IN_WINDOW) return;
      const { scrollingElement } = document;
      if (!scrollingElement) {
        logger.warn('missing document.scrollingElement try use polyfill');
        return;
      }
      state.pageXOffset = scrollingElement.scrollLeft;
      state.pageYOffset = scrollingElement.scrollTop;
    }

    function updateMenuRect(menuBodyRect?: ResizeDirectivePayload) {
      const content = stackControl.contentRef.value;
      const body = _bodyRef.value;

      if (!content || !body) {
        state.rect = null;
        return;
      }

      const originalDisplay = content.style.display;
      const originalWidth = content.style.width;
      const originalHeight = content.style.height;
      const originalMaxWidth = content.style.maxWidth;
      const originalMaxHeight = content.style.maxHeight;

      const rect = body.getBoundingClientRect();

      content.style.display = '';
      content.style.width = '';
      content.style.height = '';
      content.style.maxWidth = '';
      content.style.maxHeight = '';

      content.style.display = originalDisplay;
      content.style.width = originalWidth;
      content.style.height = originalHeight;
      content.style.maxWidth = originalMaxWidth;
      content.style.maxHeight = originalMaxHeight;

      state.rect = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        // width: menuBodyRect ? menuBodyRect.width : rect.width,
        // height: menuBodyRect ? menuBodyRect.height : rect.height,
        width: rect.width,
        height: rect.height,
      };
    }

    function updateActivatorRect() {
      const $activator = stackControl.activator;
      const el = $activator instanceof Event ? $activator.target : $activator;
      if (!el) {
        state.activatorRect = null;
        return;
      }
      const rect = (el as HTMLElement).getBoundingClientRect();

      state.activatorRect = {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    }

    function updateRects(menuBodyRect?: ResizeDirectivePayload) {
      if (!IN_WINDOW) return;
      updatePageOffset();
      updateMenuRect(menuBodyRect);
      updateActivatorRect();
    }

    const stackMenuControl: VMenuControl = {
      get pageXOffset() {
        return state.pageXOffset;
      },
      get pageYOffset() {
        return state.pageYOffset;
      },
      get distance() {
        return _distance.value;
      },
      get resizeWatchDebounce() {
        return _resizeWatchDebounce.value;
      },
      get overlap() {
        return _overlap.value;
      },
      get edgeMargin() {
        return _edgeMargin.value;
      },
      get minLeft() {
        return _minLeft.value;
      },
      get minTop() {
        return _minTop.value;
      },
      get maxRight() {
        return _maxRight.value;
      },
      get maxBottom() {
        return _maxBottom.value;
      },
      get styles() {
        return _styles.value;
      },
      bodyRef: _bodyRef,
      scrollerRef: _scrollerRef,
      updatePageOffset,
      updateMenuRect,
      updateActivatorRect,
      updateRects,
    };

    return {
      stackControl,
      stackMenuControl,
    };
  },
  render() {
    const { stackControl, stackMenuControl } = this;
    const { render, color } = stackControl;
    const { styles } = stackMenuControl;

    return render((children) => {
      return withDirectives(
        <div
          class={['v-menu', color.colorClasses.value]}
          style={styles}
          ref={stackMenuControl.scrollerRef}>
          {withDirectives(
            <div class="v-menu__body" ref={stackMenuControl.bodyRef}>
              {children}
            </div>,
            [
              resizeDirectiveArgument((payload) => {
                stackMenuControl.updateRects(payload);
              }),
            ],
          )}
        </div>,
        [
          resizeDirectiveArgument({
            handler: stackMenuControl.updateRects,
            rootMode: true,
          }),
        ],
      );
    });
  },
});

export type VMenuStatic = typeof VMenu;
