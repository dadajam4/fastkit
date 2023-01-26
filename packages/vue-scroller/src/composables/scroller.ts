import { onMounted, onBeforeUnmount, reactive, ref } from 'vue';
import {
  Scroller,
  ScrollerSetting,
  ScrollerState,
  ScrollAxis,
  ScrollDirection,
  ScrollXDirection,
  ScrollYDirection,
  ScrollerScrollOptions,
  ScrollPosition,
  ScrollToElementTarget,
  ScrollerScrollToElementOptions,
  ScrollToSideTargets,
  ScrollStopper,
  ScrollToElementAddtionalOffset,
} from '@fastkit/scroller';

export type UseScrollerTarget = 'self' | 'body';

export interface UseScrollerSetting
  extends Omit<Partial<ScrollerSetting>, 'el'> {
  el?: UseScrollerTarget;
}

const INITIAL_VALUE: any = null;

type UseScrollerState = {
  containerHeight: number;
  containerWidth: number;
  isDestroyed: boolean;
  isPending: boolean;
  isReady: boolean;
  isRunning: boolean;
  lastAxis: ScrollAxis;
  lastDirection: ScrollDirection;
  lastXDirection: ScrollXDirection;
  lastYDirection: ScrollYDirection;
  nowScrolling: boolean;
  scrollEnabled: boolean;
  scrollHeight: number;
  scrollWidth: number;
  scrollableX: boolean;
  scrollableY: boolean;
  state: ScrollerState;
  scrollBottom: number;
  scrollLeft: number;
  scrollRight: number;
  scrollTop: number;
};

const OBSERVER_READONLY_PROPS = [
  'containerHeight',
  'containerWidth',
  'isDestroyed',
  'isPending',
  'isReady',
  'isRunning',
  'lastAxis',
  'lastDirection',
  'lastXDirection',
  'lastYDirection',
  'nowScrolling',
  'scrollEnabled',
  'scrollHeight',
  'scrollWidth',
  'scrollableX',
  'scrollableY',
  'state',
] as const;

const OBSERVER_WRITABLE_PROPS = [
  'scrollBottom',
  'scrollLeft',
  'scrollRight',
  'scrollTop',
] as const;

const OBSERVER_PROPS = [...OBSERVER_READONLY_PROPS, ...OBSERVER_WRITABLE_PROPS];

function createDefaultState(): UseScrollerState {
  return reactive(
    Object.fromEntries(OBSERVER_PROPS.map((prop) => [prop, INITIAL_VALUE])),
  ) as UseScrollerState;
}

export function useScrollerControl(setting: UseScrollerSetting) {
  const isSelf = setting.el === 'self';
  const $target = isSelf ? null : undefined;
  const state = createDefaultState();
  const elementRef = ref<null | HTMLElement>(null);
  const scroller = new Scroller({
    ...setting,
    el: $target,
  });
  scroller.observe(state);

  const _scroller = {
    get elementRef() {
      return elementRef;
    },
    get scroller() {
      return scroller;
    },
    get containerHeight() {
      return state.containerHeight;
    },
    get containerWidth() {
      return state.containerWidth;
    },
    get isDestroyed() {
      return state.isDestroyed;
    },
    get isPending() {
      return state.isPending;
    },
    get isReady() {
      return state.isReady;
    },
    get isRunning() {
      return state.isRunning;
    },
    get lastAxis() {
      return state.lastAxis;
    },
    get lastDirection() {
      return state.lastDirection;
    },
    get lastXDirection() {
      return state.lastXDirection;
    },
    get lastYDirection() {
      return state.lastYDirection;
    },
    get nowScrolling() {
      return state.nowScrolling;
    },
    get scrollEnabled() {
      return state.scrollEnabled;
    },
    get scrollHeight() {
      return state.scrollHeight;
    },
    get scrollWidth() {
      return state.scrollWidth;
    },
    get scrollableX() {
      return state.scrollableX;
    },
    get scrollableY() {
      return state.scrollableY;
    },
    get state() {
      return state.state;
    },
    get scrollBottom() {
      return state.scrollBottom;
    },
    set scrollBottom(scrollBottom) {
      state.scrollBottom = scrollBottom;
    },
    get scrollLeft() {
      return state.scrollLeft;
    },
    set scrollLeft(scrollLeft) {
      state.scrollLeft = scrollLeft;
    },
    get scrollRight() {
      return state.scrollRight;
    },
    set scrollRight(scrollRight) {
      state.scrollRight = scrollRight;
    },
    get scrollTop() {
      return state.scrollTop;
    },
    set scrollTop(scrollTop) {
      state.scrollTop = scrollTop;
    },

    ready() {
      return scroller.ready();
    },

    element() {
      return elementRef.value;
    },

    start() {
      return scroller.start();
    },

    stop(): void {
      return scroller.stop();
    },

    destroy() {
      return scroller.destroy();
    },

    update(): void {
      return scroller.update();
    },

    toJSON() {
      return scroller.toJSON();
    },

    toString(): string {
      return scroller.toString();
    },

    cancel() {
      return scroller.cancel();
    },

    by(diffX: number, diffY: number, options?: ScrollerScrollOptions) {
      return scroller.by(diffX, diffY, options);
    },

    to(
      scrollPosition: Partial<ScrollPosition>,
      options?: ScrollerScrollOptions,
    ) {
      return scroller.to(scrollPosition, options);
    },

    toElement(
      target: ScrollToElementTarget,
      options?: ScrollerScrollToElementOptions,
    ) {
      return scroller.toElement(target, options);
    },

    toSide(targets: ScrollToSideTargets, options?: ScrollerScrollOptions) {
      return scroller.toSide(targets, options);
    },

    toTop(options?: ScrollerScrollOptions) {
      return scroller.toTop(options);
    },

    toRight(options?: ScrollerScrollOptions) {
      return scroller.toRight(options);
    },

    toBottom(options?: ScrollerScrollOptions) {
      return scroller.toBottom(options);
    },

    toLeft(options?: ScrollerScrollOptions) {
      return scroller.toLeft(options);
    },

    toLeftTop(options?: ScrollerScrollOptions) {
      return scroller.toLeftTop(options);
    },

    toLeftBottom(options?: ScrollerScrollOptions) {
      return scroller.toLeftBottom(options);
    },

    toRightTop(options?: ScrollerScrollOptions) {
      return scroller.toRightTop(options);
    },

    toRightBottom(options?: ScrollerScrollOptions) {
      return scroller.toRightBottom(options);
    },

    pushScrollStopper(stopper: ScrollStopper) {
      return scroller.pushScrollStopper(stopper);
    },

    removeScrollStopper(stopper: ScrollStopper) {
      return scroller.removeScrollStopper(stopper);
    },

    setScrollToElementAddtionalOffset(
      offset: ScrollToElementAddtionalOffset | undefined,
    ) {
      return scroller.setScrollToElementAddtionalOffset(offset);
    },

    deleteScrollToElementAddtionalOffset() {
      return scroller.deleteScrollToElementAddtionalOffset();
    },
  };

  if (isSelf) {
    // const selfEl = ref<null | Element | ComponentPublicInstance>(null);
    onMounted(() => {
      let el = elementRef.value;
      if (!el) return;
      if (!(el instanceof Element)) {
        el = (el as any).$el;
      }
      if (!(el instanceof Element)) return;
      scroller.setElement(el);
    });

    onBeforeUnmount(() => {
      _scroller.destroy();
    });
  }

  return _scroller;
}

export type UseScroller = ReturnType<typeof useScrollerControl>;

let _documentScroller: UseScroller | undefined;

export function getDocumentScroller() {
  if (!_documentScroller) {
    _documentScroller = useScrollerControl({ el: 'body' });
  }
  return _documentScroller;
}

export type ScrollerControl = ReturnType<typeof useScrollerControl>;
