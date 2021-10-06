import {
  reactive,
  InjectionKey,
  provide,
  inject,
  onBeforeUnmount,
  computed,
  ComputedRef,
} from 'vue';

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

  get drawerActive() {
    return this.state.drawerActive;
  }

  get activeBackdrop() {
    return this.computedActiveBackdrop.value;
  }

  get drawerIsStatic() {
    return this.computedDrawerIsStatic.value;
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

  constructor(props: VAppLayoutControlProps) {
    this.state = reactive<VAppLayoutControlState>({
      drawerActive: false,
      backdropConditions: {
        viewport: [],
        drawer: [],
        systembar: [],
        cover: [],
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

    provide(VAppLayoutControl.injectionKey, this);

    onBeforeUnmount(() => {
      this.destroy();
    });
  }

  destroy() {
    this.closeDrawer();
    this.backdropHandlers = [];
    this.releaseBackdrops();
  }
}
