import {
  reactive,
  InjectionKey,
  provide,
  inject,
  onMounted,
  onBeforeUnmount,
  computed,
  ComputedRef,
} from 'vue';
import { getDocumentScroller } from '@fastkit/vue-scroller';
import { useWindow } from '@fastkit/vue-utils';

export type VAppLayoutControlBackdropCondition = () => boolean;

const BACKDROP_POSITIONS = [
  'cover',
  'systembar',
  'drawer',
  'viewport',
] as const;

export type VAppLayoutControlBackdropPosition =
  typeof BACKDROP_POSITIONS[number];

export type VAppLayoutControlBackdropHandler = (
  ev: MouseEvent,
  position: VAppLayoutControlBackdropPosition,
) => void | false;

export interface VAppLayoutControlState {
  drawerActive: boolean;
  backdropConditions: Record<
    VAppLayoutControlBackdropPosition,
    VAppLayoutControlBackdropCondition[]
  >;
  viewportOffsets: {
    top: number;
    bottom: number;
  };
}

export type VAppLayoutControlConditionalFn = () => boolean;

export type RawVAppLayoutControlConditionalFn =
  | VAppLayoutControlConditionalFn
  | boolean;

export interface VAppLayoutControlProps {
  readonly drawerStatic?: RawVAppLayoutControlConditionalFn;
}

export class VAppLayoutControl {
  static injectionKey: InjectionKey<VAppLayoutControl> = Symbol();
  static BACKDROP_POSITIONS = BACKDROP_POSITIONS;

  static use() {
    const layoutControl = inject(this.injectionKey);
    if (!layoutControl) {
      throw new Error('VAppLayoutControl is not privided.');
    }
    return layoutControl;
  }

  private state: VAppLayoutControlState;
  private backdropHandlers: VAppLayoutControlBackdropHandler[] = [];
  readonly computedActiveBackdrop: ComputedRef<
    VAppLayoutControlBackdropPosition | undefined
  >;
  readonly computedDrawerIsStatic: ComputedRef<boolean>;
  readonly window = useWindow();

  get drawerActive() {
    return this.state.drawerActive;
  }

  get activeBackdrop() {
    return this.computedActiveBackdrop.value;
  }

  get drawerIsStatic() {
    return this.computedDrawerIsStatic.value;
  }

  get viewportOffsets() {
    return this.state.viewportOffsets;
  }

  get viewportHeight() {
    const { top, bottom } = this.viewportOffsets;
    // const { height } = this.window;
    return this.window.height - top - bottom;
  }

  calicurateViewHeight(height: number | string, adds = 0, minHeight = 0) {
    if (typeof height === 'number')
      return `${Math.max(height + adds, minHeight)}px`;
    const perMatch = height.match(/([\d.]+)%$/);
    if (!perMatch) return height;
    const num = Number(perMatch[1]);
    return isNaN(num)
      ? height
      : `${Math.max((this.viewportHeight * num) / 100 + adds, minHeight)}px`;
  }

  onClickBackdrop(handler: VAppLayoutControlBackdropHandler) {
    this.offClickBackdrop(handler);
    this.backdropHandlers.push(handler);
    return () => {
      this.offClickBackdrop(handler);
    };
  }

  offClickBackdrop(handler: VAppLayoutControlBackdropHandler) {
    this.backdropHandlers = this.backdropHandlers.filter((h) => h !== handler);
  }

  emitClickBackdrop(
    ev: MouseEvent,
    position: VAppLayoutControlBackdropPosition,
  ) {
    let result: false | undefined;
    ev.stopPropagation();
    for (const handler of this.backdropHandlers) {
      if (handler(ev, position) === false) {
        result = false;
        break;
      }
    }
    return result;
  }

  openDrawer() {
    this.state.drawerActive = true;
  }

  closeDrawer() {
    this.state.drawerActive = false;
  }

  toggleDrawer() {
    this.state.drawerActive = !this.state.drawerActive;
  }

  requestBackdrop(
    position: VAppLayoutControlBackdropPosition,
    condition: VAppLayoutControlBackdropCondition,
  ) {
    this.releaseBackdrop(position, condition);
    this.state.backdropConditions[position].push(condition);
    return () => {
      this.releaseBackdrop(position, condition);
    };
  }

  releaseBackdrop(
    position: VAppLayoutControlBackdropPosition,
    condition: VAppLayoutControlBackdropCondition,
  ) {
    const { backdropConditions } = this.state;
    backdropConditions[position] = backdropConditions[position].filter(
      (c) => c !== condition,
    );
  }

  releaseBackdrops() {
    const { backdropConditions } = this.state;
    BACKDROP_POSITIONS.forEach((position) => {
      backdropConditions[position] = [];
    });
  }

  private _scrollerOffset() {
    return -this.viewportOffsets.top;
  }

  constructor(props: VAppLayoutControlProps) {
    this.state = reactive<VAppLayoutControlState>({
      drawerActive: false,
      backdropConditions: {
        viewport: [],
        drawer: [],
        systembar: [],
        cover: [],
      },
      viewportOffsets: {
        top: 0,
        bottom: 0,
      },
    });

    this.computedActiveBackdrop = computed(() => {
      const { backdropConditions } = this.state;
      return BACKDROP_POSITIONS.find((position) => {
        return backdropConditions[position].some((c) => c());
      });
    });

    this.computedDrawerIsStatic = computed(() => {
      const drawerStatic = props.drawerStatic;
      if (!drawerStatic) return false;
      const computedDrawerStatic =
        typeof drawerStatic === 'function' ? drawerStatic() : drawerStatic;
      return computedDrawerStatic;
    });

    this._scrollerOffset = this._scrollerOffset.bind(this);

    provide(VAppLayoutControl.injectionKey, this);

    onMounted(() => {
      _globalLayoutControl = this;
      const scroller = getDocumentScroller();
      scroller.setScrollToElementAddtionalOffset(this._scrollerOffset);
    });

    onBeforeUnmount(() => {
      this.destroy();
    });
  }

  destroy() {
    this.closeDrawer();
    this.backdropHandlers = [];
    this.releaseBackdrops();
    _globalLayoutControl = undefined;
    const scroller = getDocumentScroller();
    scroller.deleteScrollToElementAddtionalOffset();
  }
}

let _globalLayoutControl: VAppLayoutControl | undefined;

export function getGlobalLayoutControl() {
  return _globalLayoutControl;
}
