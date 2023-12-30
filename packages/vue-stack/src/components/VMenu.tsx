import './VMenu.scss';
import {
  defineComponent,
  computed,
  PropType,
  reactive,
  CSSProperties,
  withDirectives,
  ref,
  ComponentPropsOptions,
  EmitsOptions,
  Ref,
  SlotsType,
  watch,
  onBeforeUnmount,
} from 'vue';
import {
  createStackableDefine,
  MergeStackBaseSlots,
  StackableTabCloseSpec,
} from '../schemes';
import {
  DefineStackableSettings,
  setupStackableComponent,
  StackableSetupContext,
  EmitsToPropOptions,
} from '../composables';
import {
  useWindow,
  UseWindowRef,
  resizeDirectiveArgument,
  ResizeDirectivePayload,
} from '@fastkit/vue-resize';
import { type ExtractPropInput } from '@fastkit/vue-utils';
import { logger, VueStackError } from '../logger';
import { IN_WINDOW } from '@fastkit/helpers';
import { getScrollParents } from '../utils';

const DEFAULT_EDGE_MARGIN = 20;
const DEFAULT_DISTANCE = 10;
const DEFAULT_RESIZE_WATCH_DEBOUNCE = 250;
const DEFAULT_TRANSITION = 'v-menu-auto';

/**
 * Overlap settings with the activator
 *
 * - `allow` Allow overlapping if display space is insufficient
 * - `disallow` Do not allow overlapping even when display space is insufficient.
 * - `overlap` Overlap on the activator
 *
 * If internal position settings like (left, right, top, bottom)-inner are used, this configuration does not apply to that axis.
 */
export type MenuOverlapSettings = 'allow' | 'disallow' | 'overlap';

type RawMenuOverlapSettings = MenuOverlapSettings | boolean;

interface CreateMenuSchemeOptions {
  /**
   * @default "v-menu-auto"
   */
  defaultTransition?: string;
  /**
   * @default true
   */
  defaultScrollLock?: boolean;
  defaultDistance?: number;
  defaultEdgeMargin?: number;
  defaultResizeWatchDebounce?: number;
  /**
   * @default false
   */
  defaultAllowOverflow?: boolean;
  /**
   * @default false
   */
  defaultOverlap?: RawMenuOverlapSettings;
  /** @default true */
  defaultCloseOnEsc?: boolean;
  /** @default true */
  defaultCloseOnTab?: StackableTabCloseSpec;
}

type MenuSizeSpec = number | 'fit' | 'free';

type RawMenuMaxSize =
  | MenuSizeSpec
  | ((window: UseWindowRef) => number | undefined);

const RAW_MENU_SIZE_PROP = {
  type: [Number, String] as PropType<number | 'fit' | 'free'>,
  default: undefined,
};

const RAW_MENU_MAX_SIZE_PROP = [
  Number,
  String,
  Function,
] as PropType<RawMenuMaxSize>;

export function createMenuProps(options: CreateMenuSchemeOptions = {}) {
  const {
    defaultDistance = DEFAULT_DISTANCE,
    defaultEdgeMargin = DEFAULT_EDGE_MARGIN,
    defaultResizeWatchDebounce = DEFAULT_RESIZE_WATCH_DEBOUNCE,
    defaultAllowOverflow = false,
    defaultOverlap = false,
  } = options;

  return {
    /**
     * Horizontal Axis Position
     *
     * - `left` To the left of the activator.
     * - `left-inner` Align to the left edge of the activator.
     * - `center` Align to the center of the activator.
     * - `right` To the right of the activator.
     * - `right-inner` Align to the right edge of the activator.
     */
    x: String as PropType<VMenuXPosition>,
    /**
     * Vertical Axis Position
     *
     * - `top` To the top of the activator.
     * - `top-inner` Align to the top edge of the activator.
     * - `center` Align to the center of the activator.
     * - `bottom` To the bottom of the activator.
     * - `bottom-inner` Align to the bottom edge of the activator.
     */
    y: String as PropType<VMenuYPosition>,
    /**
     * Allow overflow from the screen.
     *
     * If this setting is not enabled, the element's size will be reduced when exceeding coordinates beyond the screen edge, subtracting the edge margin.
     */
    allowOverflow: {
      type: Boolean,
      default: defaultAllowOverflow,
    },
    /**
     * width
     *
     * Either specify a pixel size or use "fit". When "fit" is chosen, the width will match that of the activator.
     */
    width: RAW_MENU_SIZE_PROP,
    /**
     * height
     *
     * Either specify a pixel size or use "fit". When "fit" is chosen, the height will match that of the activator.
     */
    height: RAW_MENU_SIZE_PROP,
    /**
     * Minimum width
     *
     * Either specify a pixel size or use "fit". When "fit" is chosen, the width will match that of the activator.
     */
    minWidth: RAW_MENU_SIZE_PROP,
    /**
     * Minimum height
     *
     * Either specify a pixel size or use "fit". When "fit" is chosen, the width will match that of the activator.
     */
    minHeight: RAW_MENU_SIZE_PROP,
    /**
     * Maximum width
     *
     * It is possible to set values that can be configured as CSS or dynamic sizes through callback functions.
     *
     * This setting is ignored if `allowOverflow` is enabled.
     *
     * @see {@link RAW_MENU_MAX_SIZE_PROP}
     */
    maxWidth: RAW_MENU_MAX_SIZE_PROP,
    /**
     * Maximum height
     *
     * It is possible to set values that can be configured as CSS or dynamic sizes through callback functions.
     *
     * This setting is ignored if `allowOverflow` is enabled.
     *
     * @see {@link RAW_MENU_MAX_SIZE_PROP}
     */
    maxHeight: RAW_MENU_MAX_SIZE_PROP,
    /**
     * Distance from the activator (in pixels).
     *
     * If a position setting, such as (left, right, top, bottom)-inner, is used, the distance is not applied to that axis.
     */
    distance: {
      type: Number,
      default: defaultDistance,
    },
    /**
     * Margin from the screen edge
     *
     * By default, it is controlled to ensure that the coordinates, subtracted by this margin from the screen edge, do not overflow.
     */
    edgeMargin: {
      type: Number,
      default: defaultEdgeMargin,
    },
    /**
     * Overlap settings with the activator
     *
     * - `allow` | `false` Allow overlapping if display space is insufficient
     * - `disallow` Do not allow overlapping even when display space is insufficient.
     * - `overlap` | `true` Overlap on the activator
     *
     * If internal position settings like (left, right, top, bottom)-inner are used, this configuration does not apply to that axis.
     *
     * @see {@link MenuOverlapSettings}
     */
    overlap: {
      type: [Boolean, String] as PropType<MenuOverlapSettings | boolean>,
      default: defaultOverlap,
    },
    resizeWatchDebounce: {
      type: Number,
      default: defaultResizeWatchDebounce,
    },
  };
}

function createMenuScheme(options: CreateMenuSchemeOptions = {}) {
  const {
    defaultTransition = DEFAULT_TRANSITION,
    defaultScrollLock = false,
    defaultCloseOnEsc = true,
    defaultCloseOnTab = true,
  } = options;

  const { props, emits } = createStackableDefine({
    defaultTransition,
    defaultScrollLock,
    defaultCloseOnEsc,
    defaultCloseOnTab,
  });

  return {
    props: {
      ...props,
      ...createMenuProps(options),
    },
    emits,
  };
}

export type MenuPropsOptions = ReturnType<typeof createMenuProps>;

export type MenuInput = ExtractPropInput<MenuPropsOptions>;

export type MenuEmits = ReturnType<typeof createMenuScheme>['emits'];

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

export interface VMenuRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface VMenuRectInfo extends VMenuRect {
  positions: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
    xInner: boolean;
    yInner: boolean;
  };
  bubble: {
    styles: {
      '--bubble-top'?: string;
      '--bubble-bottom'?: string;
      '--bubble-left'?: string;
      '--bubble-right'?: string;
    };
  };
}

export interface VMenuState {
  pageXOffset: number;
  pageYOffset: number;
  rect: VMenuRect | null;
  activatorRect: VMenuRect | null;
}

export interface MenuAPI {
  readonly attrs: Record<string, any>;
  readonly pageXOffset: number;
  readonly pageYOffset: number;
  readonly distance: number;
  readonly resizeWatchDebounce: number;
  readonly overlap: MenuOverlapSettings;
  readonly edgeMargin: number;
  readonly minLeft: number;
  readonly minTop: number;
  readonly maxRight: number;
  readonly maxBottom: number;
  readonly rect: VMenuRectInfo | null;
  readonly styles: CSSProperties;
  readonly scrollerRef: Ref<HTMLElement | null>;
  readonly bodyRef: Ref<HTMLElement | null>;
  updatePageOffset(): void;
  updateMenuRect(menuBodyRect?: ResizeDirectivePayload): void;
  updateActivatorRect(): void;
  updateRects(menuBodyRect?: ResizeDirectivePayload): void;
}

export interface DefineMenuSettings<
  Props extends Readonly<ComponentPropsOptions>,
  Emits extends EmitsOptions,
  Slots extends SlotsType,
> extends DefineStackableSettings<
      Props & MenuPropsOptions,
      Emits,
      Slots,
      MenuAPI
    >,
    CreateMenuSchemeOptions {
  props?: Props;
  emits?: Emits;
  slots?: Slots;
  attrs?:
    | Record<string, any>
    | ((
        ctx: StackableSetupContext<Props, Emits, Slots, MenuAPI>,
      ) => Record<string, any>);
}

export function defineMenuComponent<
  Props extends Readonly<ComponentPropsOptions> = {},
  Emits extends EmitsOptions = {},
  Slots extends SlotsType = SlotsType<{}>,
>(settings: DefineMenuSettings<Props, Emits, Slots>) {
  const baseScheme = createMenuScheme(settings);
  const { name, props, emits } = settings;

  const Component = defineComponent({
    name,
    inheritAttrs: false,
    props: {
      ...baseScheme.props,
      ...props,
    } as typeof baseScheme.props &
      Props &
      EmitsToPropOptions<typeof baseScheme.emits & Emits>,
    emits: {
      ...baseScheme.emits,
      ...emits,
    } as typeof baseScheme.emits & Emits,
    slots: settings.slots as MergeStackBaseSlots<Slots>,
    setup(_props, _ctx) {
      const baseCtx = setupStackableComponent<
        MenuPropsOptions,
        {},
        Slots,
        MenuAPI
      >(_props, _ctx, {
        onContentMounted: () => {
          updateRects();
          // startHandleResize();
        },
        // onContentDetached: stopHandleResize,
        transitionResolver,
      });

      const { props, control } = baseCtx;

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

      const _overlap = computed<MenuOverlapSettings>(() => {
        const { overlap } = props;
        if (typeof overlap === 'boolean') {
          return overlap ? 'overlap' : 'allow';
        }
        return overlap;
      });
      const _edgeMargin = computed(() => props.edgeMargin);

      const calcMinEdge = (direction: 'left' | 'top') => {
        const pageOffset =
          direction === 'left' ? state.pageXOffset : state.pageYOffset;
        const min = _edgeMargin.value + pageOffset;
        const activatorEdge = state.activatorRect?.[direction];
        if (activatorEdge === undefined) return min;
        if (activatorEdge < 0) {
          return pageOffset;
        }
        if (activatorEdge < min) {
          return activatorEdge;
        }
        return min;
      };

      const calcMaxEdge = (direction: 'right' | 'bottom') => {
        const isX = direction === 'right';
        const pageOffset = isX ? state.pageXOffset : state.pageYOffset;
        const windowSize = isX ? $window.width : $window.height;
        const max = windowSize - _edgeMargin.value + pageOffset;
        const activatorEdge = state.activatorRect?.[direction];
        if (activatorEdge === undefined) return max;
        if (activatorEdge > windowSize) {
          return pageOffset + windowSize;
        }
        if (activatorEdge + pageOffset > max) {
          return activatorEdge + pageOffset;
        }
        return max;
      };

      const _minLeft = computed(() => calcMinEdge('left'));
      const _minTop = computed(() => calcMinEdge('top'));
      const _maxRight = computed(() => calcMaxEdge('right'));
      const _maxBottom = computed(() => calcMaxEdge('bottom'));

      const resolveMaxSize = (
        raw: RawMenuMaxSize | undefined,
      ): MenuSizeSpec | undefined => {
        if (raw == null) return raw;
        if (typeof raw === 'function') {
          return baseCtx.control.isActive ? raw($window) : undefined;
        }
        return raw;
      };
      const resolveSize = (size: number | 'fit' | 'free' | undefined) => {
        return size === 'free' ? undefined : size;
      };

      const _width = computed(() => resolveSize(props.width));
      const _height = computed(() => resolveSize(props.height));
      const _minWidth = computed(() => resolveSize(props.minWidth));
      const _minHeight = computed(() => resolveSize(props.minHeight));
      const _maxWidth = computed(() => resolveMaxSize(props.maxWidth));
      const _maxHeight = computed(() => resolveMaxSize(props.maxHeight));

      const _positionFlags = computed(() => {
        let { x, y } = props;
        if (!y && (!x || x === 'left-inner' || x === 'right-inner')) {
          y = 'bottom';
        }

        if (!y) {
          y = 'center';
        }

        if (!x) {
          if (y === 'bottom-inner' || y === 'top-inner') {
            x = 'left';
          } else {
            x = 'center';
          }
        }

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

      function transitionResolver(): string {
        return _transition.value;
      }

      const _transition = computed<string>(() => {
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

      const _rect = computed<VMenuRectInfo | null>(() => {
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
        const overlapSettings = _overlap.value;
        const isOverlap = overlapSettings === 'overlap';
        const disallowOverlap = overlapSettings === 'disallow';

        let computedWidth = _width.value;
        let computedHeight = _height.value;
        let computedMinWidth = _minWidth.value;
        const computedMinHeight = _minHeight.value;
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

        const _mw = computedWidth;
        const _mh = computedHeight;

        if (computedWidth === 'fit')
          computedWidth = Math.max(activatorWidth, myWidth);
        if (computedHeight === 'fit')
          computedHeight = Math.max(activatorHeight, myHeight);
        if (computedMaxWidth === 'fit') computedMaxWidth = activatorWidth;
        if (computedMaxHeight === 'fit') computedMaxHeight = activatorHeight;

        if (computedMinWidth === 'fit') computedMinWidth = activatorWidth;
        if (computedMinHeight === 'fit') computedMinWidth = activatorHeight;

        let {
          top: isTop,
          bottom: isBottom,
          left: isLeft,
          right: isRight,
        } = _positionFlags.value;

        const { xInner, yInner } = _positionFlags.value;

        width = typeof computedWidth === 'number' ? computedWidth : myWidth;
        height = typeof computedHeight === 'number' ? computedHeight : myHeight;

        const overlapHeight = isOverlap ? activatorHeight : 0;
        const overlapWidth = isOverlap ? activatorWidth : 0;
        const topFree = activatorTop - _edgeMargin.value + overlapHeight;
        const bottomFree =
          $window.height - _edgeMargin.value - activatorBottom + overlapHeight;
        const leftFree = activatorLeft - _edgeMargin.value + overlapWidth;
        const rightFree =
          $window.width - _edgeMargin.value - activatorRight + overlapWidth;

        if (typeof computedMinWidth === 'number' && width < computedMinWidth) {
          width = computedMinWidth;
        }
        if (typeof computedMaxWidth === 'number' && width > computedMaxWidth) {
          width = computedMaxWidth;
        }
        if (
          typeof computedMinHeight === 'number' &&
          height < computedMinHeight
        ) {
          height = computedMinHeight;
        }
        if (
          typeof computedMaxHeight === 'number' &&
          height > computedMaxHeight
        ) {
          height = computedMaxHeight;
        }

        if (!yInner && (computedMaxHeight == null || _mh !== 'fit')) {
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

        if (!xInner && (computedMaxWidth == null || _mw !== 'fit')) {
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

        if (
          !allowOverflow &&
          typeof computedMaxWidth === 'number' &&
          width > computedMaxWidth
        ) {
          width = computedMaxWidth;
        }

        if (
          !allowOverflow &&
          typeof computedMaxHeight === 'number' &&
          height > computedMaxHeight
        ) {
          height = computedMaxHeight;
        }

        if (isTop) {
          if (yInner) {
            top = activatorTop;
          } else {
            top = activatorTop - height;
            if (isOverlap) top += activatorHeight;
          }
        } else if (isBottom) {
          if (yInner) {
            top = activatorBottom - height;
          } else {
            top = activatorBottom;
            if (isOverlap) top -= activatorHeight;
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
            if (isOverlap) left += activatorWidth;
          }
        } else if (isRight) {
          if (xInner) {
            left = activatorRight - width;
          } else {
            left = activatorRight;
            if (isOverlap) left -= activatorWidth;
          }
        } else {
          left = activatorLeft - (width - activatorWidth) / 2;
        }

        left += pageXOffset;

        if (!isOverlap) {
          if (!yInner) {
            if (isBottom) {
              top += distance;
            } else if (isTop) {
              top -= distance;
            }
          }

          if (!xInner) {
            if (isRight) {
              left += distance;
            } else if (isLeft) {
              left -= distance;
            }
          }
        }

        let right = left + width;
        let bottom = top + height;

        // ==================================================
        // If it extends beyond the screen (plus edge margin), it will move towards the inside.
        // ==================================================

        const rightOverflow = right - maxRight;
        if (rightOverflow > 0) {
          left -= rightOverflow;
          right -= rightOverflow;
          if (isRight && disallowOverlap) {
            const overlapSize = activatorRight + distance + pageXOffset - left;
            if (overlapSize > 0) {
              left += overlapSize;
              right += overlapSize;
            }
          }
        }

        const bottomOverflow = bottom - maxBottom;
        if (bottomOverflow > 0) {
          top -= bottomOverflow;
          bottom -= bottomOverflow;
          if (isBottom && disallowOverlap) {
            const overlapSize = activatorBottom + distance + pageYOffset - top;
            if (overlapSize > 0) {
              top += overlapSize;
              bottom += overlapSize;
            }
          }
        }

        const leftOverflow = minLeft - left;
        if (leftOverflow > 0) {
          left += leftOverflow;
          right += leftOverflow;
          if (isLeft && disallowOverlap) {
            const overlapSize =
              right - (activatorLeft - distance + pageXOffset);
            if (overlapSize > 0) {
              left -= overlapSize;
              right -= overlapSize;
            }
          }
        }

        const topOverflow = minTop - top;
        if (topOverflow > 0) {
          top += topOverflow;
          bottom += topOverflow;
          if (isTop && disallowOverlap) {
            const overlapSize =
              bottom - (activatorTop - distance + pageYOffset);
            if (overlapSize > 0) {
              top -= overlapSize;
              bottom -= overlapSize;
            }
          }
        }

        // ==================================================
        // If allowOverflow is disabled and it extends beyond the screen (plus edge margin), then reduce the size.
        // ==================================================
        if (!allowOverflow) {
          const overflowRight = right - maxRight;
          if (overflowRight > 0) {
            width -= overflowRight;
            right -= overflowRight;
          }
          const overflowBottom = bottom - maxBottom;
          if (overflowBottom > 0) {
            height -= overflowBottom;
            bottom -= overflowBottom;
          }
          const overflowLeft = minLeft - left;
          if (overflowLeft > 0) {
            width -= overflowLeft;
            left += overflowLeft;
          }
          const overflowTop = minTop - top;
          if (overflowTop > 0) {
            height -= overflowTop;
            top += overflowTop;
          }
        }

        const bubbleStyles: VMenuRectInfo['bubble']['styles'] = {};
        if (isTop) {
          if (yInner) {
            bubbleStyles['--bubble-top'] = `${activatorHeight * 0.5}px`;
          } else {
            bubbleStyles['--bubble-top'] = '100%';
          }
        } else if (isBottom) {
          if (yInner) {
            bubbleStyles['--bubble-bottom'] = `${activatorHeight * 0.5}px`;
          } else {
            bubbleStyles['--bubble-bottom'] = '100%';
          }
        } else {
          bubbleStyles['--bubble-top'] = `${
            activatorHeight * 0.5 + (activatorTop - top)
          }px`;
        }

        if (isLeft) {
          if (xInner) {
            bubbleStyles['--bubble-left'] = `${Math.min(
              width * 0.5,
              activatorWidth * 0.5,
            )}px`;
          } else {
            bubbleStyles['--bubble-left'] = '100%';
          }
        } else if (isRight) {
          if (xInner) {
            bubbleStyles['--bubble-right'] = `${Math.min(
              width * 0.5,
              activatorWidth * 0.5,
            )}px`;
          } else {
            bubbleStyles['--bubble-right'] = '100%';
          }
        } else {
          bubbleStyles['--bubble-left'] = `${
            activatorWidth * 0.5 + (activatorLeft - left)
          }px`;
        }

        return {
          left,
          right,
          top,
          bottom,
          width,
          height,
          positions: {
            top: isTop,
            bottom: isBottom,
            left: isLeft,
            right: isRight,
            xInner,
            yInner,
          },
          bubble: {
            styles: bubbleStyles,
          },
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

          Object.assign(styles, rect.bubble.styles);
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
        const content = control.contentRef.value;
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

      function getActivatorElement() {
        const $activator = control.activator;
        return $activator instanceof Event
          ? ($activator.target as HTMLElement)
          : $activator;
      }

      function getCurrentScrollParents():
        | {
            activator: HTMLElement;
            parents: HTMLElement[];
          }
        | undefined {
        const activator = getActivatorElement();
        if (!activator) return;
        const parents = getScrollParents(activator);
        return {
          activator,
          parents,
        };
      }

      function updateActivatorRect() {
        const el = getActivatorElement();
        if (!el) {
          // state.activatorRect = null;
          return;
        }
        const rect = el.getBoundingClientRect();

        const { width, height } = rect;
        if (width === 0 && height === 0) return;

        state.activatorRect = {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width,
          height,
        };
      }

      function updateRects(menuBodyRect?: ResizeDirectivePayload) {
        if (!IN_WINDOW) return;
        updatePageOffset();
        updateMenuRect(menuBodyRect);
        updateActivatorRect();
      }

      let _currentScrollParents:
        | {
            activator: HTMLElement;
            parents: HTMLElement[];
          }
        | undefined;
      let _activatorResizeObserver: ResizeObserver | undefined;
      let _activatorResizeRAF_ID: number | undefined;

      const _clearActivatorResizeRAF = () => {
        if (_activatorResizeRAF_ID !== undefined) {
          cancelAnimationFrame(_activatorResizeRAF_ID);
          _activatorResizeRAF_ID = undefined;
        }
      };

      const _handleActivatorResize = () => {
        _clearActivatorResizeRAF();
        _activatorResizeRAF_ID = requestAnimationFrame(() => {
          _clearActivatorResizeRAF();
          updateRects();
        });
      };

      function handleScrollerScroll(ev: Event) {
        updateRects();
      }

      function resetScrollerScroll() {
        if (_activatorResizeObserver) {
          _activatorResizeObserver.disconnect();
          _activatorResizeObserver = undefined;
        }
        _clearActivatorResizeRAF();
        if (!_currentScrollParents) return;
        for (const el of _currentScrollParents.parents) {
          const eventTarget = el === document.documentElement ? document : el;
          eventTarget.removeEventListener('scroll', handleScrollerScroll, {
            capture: false,
          });
        }
        _currentScrollParents = undefined;
      }

      function setupScrollerScroll() {
        resetScrollerScroll();
        _currentScrollParents = getCurrentScrollParents();
        if (!_currentScrollParents) return;

        const { activator, parents } = _currentScrollParents;
        _activatorResizeObserver = new ResizeObserver(_handleActivatorResize);
        _activatorResizeObserver.observe(activator);

        for (const el of parents) {
          const eventTarget = el === document.documentElement ? document : el;
          eventTarget.addEventListener('scroll', handleScrollerScroll, {
            capture: false,
            passive: true,
          });
        }
      }

      watch(
        () => control.isActive,
        (isActive) => {
          return isActive ? setupScrollerScroll() : resetScrollerScroll();
        },
      );

      onBeforeUnmount(resetScrollerScroll);

      const stackMenuCtx: typeof baseCtx = {
        ...baseCtx,
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
        get rect() {
          return _rect.value;
        },
        get styles() {
          return _styles.value;
        },
        get attrs() {
          return {
            // class: snackClasses.value,
            ref: _bodyRef,
          };
        },
        bodyRef: _bodyRef,
        scrollerRef: _scrollerRef,
        updatePageOffset,
        updateMenuRect,
        updateActivatorRect,
        updateRects,
      };

      const render = settings.setup?.(stackMenuCtx as any) || settings.render;
      if (!render) {
        throw new VueStackError('render function is required.');
      }

      const hostAttrs = computed(() => {
        const { attrs = {} } = settings;
        const _attrs =
          typeof attrs === 'function' ? attrs(stackMenuCtx as any) : attrs;

        return {
          ..._attrs,
          class: ['v-stack-menu', _attrs.class],
        };
      });

      return () => {
        return control.render((children) => {
          return withDirectives(
            <div {...hostAttrs.value} style={_styles.value} ref={_scrollerRef}>
              {withDirectives(render(children, stackMenuCtx as any), [
                resizeDirectiveArgument(updateRects),
              ])}
            </div>,
            [
              resizeDirectiveArgument({
                handler: updateRects,
                rootMode: true,
              }),
            ],
          );
        });
      };
    },
  });

  return Component;
}
