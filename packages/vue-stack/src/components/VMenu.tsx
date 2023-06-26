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
import { createStackableDefine, MergeStackBaseSlots } from '../schemes';
import {
  DefineStackableSettings,
  setupStackableComponent,
} from '../composables';
import {
  useWindow,
  UseWindowRef,
  resizeDirectiveArgument,
  ResizeDirectivePayload,
} from '@fastkit/vue-resize';
import { logger, VueStackError } from '../logger';
import { IN_WINDOW } from '@fastkit/helpers';
import { getScrollParents } from '../utils';

const DEFAULT_EDGE_MARGIN = 20;
const DEFAULT_DISTANCE = 10;
const DEFAULT_RESIZE_WATCH_DEBOUNCE = 250;
const DEFAULT_TRANSITION = 'v-menu-auto';

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
}

type MenuMaxSize = number | 'fit' | 'free';

type RawMenuMaxSize =
  | MenuMaxSize
  | ((window: UseWindowRef) => number | undefined);

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
  } = options;

  return {
    x: String as PropType<VMenuXPosition>,
    y: String as PropType<VMenuYPosition>,
    allowOverflow: Boolean,
    width: [Number, String] as PropType<number | 'fit'>,
    height: [Number, String] as PropType<number | 'fit'>,
    maxWidth: RAW_MENU_MAX_SIZE_PROP,
    maxHeight: RAW_MENU_MAX_SIZE_PROP,
    distance: {
      type: Number,
      default: defaultDistance,
    },
    edgeMargin: {
      type: Number,
      default: defaultEdgeMargin,
    },
    resizeWatchDebounce: {
      type: Number,
      default: defaultResizeWatchDebounce,
    },
    overlap: Boolean,
  };
}

function createMenuScheme(options: CreateMenuSchemeOptions = {}) {
  const { defaultTransition = DEFAULT_TRANSITION, defaultScrollLock = false } =
    options;

  const { props, emits } = createStackableDefine({
    defaultTransition,
    defaultScrollLock,
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

export type MenuEmits = ReturnType<typeof createMenuScheme>['emits'];

// export const stackMenuEmits = emits;

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
  readonly overlap: boolean;
  readonly edgeMargin: number;
  readonly minLeft: number;
  readonly minTop: number;
  readonly maxRight: number;
  readonly maxBottom: number;
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
  attrs?: Record<string, any>;
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
    } as typeof baseScheme.props & Props,
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

      const resolveMaxSize = (
        raw: RawMenuMaxSize | undefined,
      ): MenuMaxSize | undefined => {
        if (raw == null) return raw;
        if (typeof raw === 'function') {
          return baseCtx.control.isActive ? raw($window) : undefined;
        }
        return raw;
      };
      const _width = computed(() => props.width);
      const _height = computed(() => props.height);
      const _maxWidth = computed(() => resolveMaxSize(props.maxWidth));
      const _maxHeight = computed(() => resolveMaxSize(props.maxHeight));

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

        const _mw = computedWidth;
        const _mh = computedHeight;

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

        if (typeof computedMaxWidth === 'number' && width > computedMaxWidth) {
          width = computedMaxWidth;
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

        if (typeof computedMaxWidth === 'number' && width > computedMaxWidth) {
          width = computedMaxWidth;
        }
        if (
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
      let _activatorResizeRAFID: number | undefined;

      const _clearActivatorResizeRAF = () => {
        if (_activatorResizeRAFID !== undefined) {
          cancelAnimationFrame(_activatorResizeRAFID);
          _activatorResizeRAFID = undefined;
        }
      };

      const _handleActivatorResize = () => {
        _clearActivatorResizeRAF();
        _activatorResizeRAFID = requestAnimationFrame(() => {
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

      const hostBaseAttrs = settings.attrs || {};

      const hostAttrs = {
        ...hostBaseAttrs,
        class: ['v-stack-menu', hostBaseAttrs.class],
      };

      return () => {
        return control.render((children) => {
          return withDirectives(
            <div {...hostAttrs} style={_styles.value} ref={_scrollerRef}>
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
