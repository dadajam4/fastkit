import { ref, computed, ComputedRef, Ref, watch } from 'vue';
import type { VueAppLayout } from './layout';
import type { VueAppStack, VueAppStackBaseSettings } from './stack';
import {
  VueAppLayoutPositionX,
  VueAppLayoutPositionY,
  VAL_DRAWER_DEFAULT_POSITION,
  VueAppLayoutStickPositionY,
  VueAppDrawerId,
  VAL_STACK_DEFAULT_POSITION_Y,
} from '../schemes';

export type VueAppDrawerStaticCondition = boolean | (() => boolean);

export type VueAppDrawerRaleCondition = boolean | (() => boolean);

export type VueAppDrawerResolvedStickedSettings = Record<
  VueAppLayoutPositionY,
  VueAppLayoutStickPositionY
>;

export type VueAppDrawerStickedSettings =
  | boolean
  | VueAppLayoutStickPositionY
  | Partial<VueAppDrawerResolvedStickedSettings>;

export interface VueAppDrawerSettings extends VueAppStackBaseSettings {
  id?: VueAppDrawerId | VueAppDrawerControl;
  /**
   * @default "left"
   */
  position?: VueAppLayoutPositionX;
  sticked?: VueAppDrawerStickedSettings;
  static?: VueAppDrawerStaticCondition;
  rale?: VueAppDrawerRaleCondition;
  backdrop?: boolean;
}

export class VueAppDrawer {
  readonly layout: VueAppLayout;
  private _stack: Ref<VueAppStack | null> = ref(null);
  readonly id: VueAppDrawerId;
  private _position: ComputedRef<VueAppLayoutPositionX>;
  private _static: ComputedRef<boolean>;
  private _rale: ComputedRef<boolean>;
  private _backdrop: ComputedRef<boolean>;
  private _sticked: ComputedRef<VueAppDrawerResolvedStickedSettings>;

  get stack() {
    return this._stack.value;
  }

  get isActive() {
    return (!this.isStatic && this.stack?.active) || false;
  }

  get position() {
    return this._position.value;
  }

  get sticked() {
    return this._sticked.value;
  }

  get top() {
    return this.sticked.top;
  }

  get bottom() {
    return this.sticked.bottom;
  }

  get isStatic() {
    return this._static.value;
  }

  get isRale() {
    return this._rale.value;
  }

  get hasBackdrop() {
    return this._backdrop.value && !this.isStatic;
  }

  constructor(layout: VueAppLayout, settings: VueAppDrawerSettings) {
    this.layout = layout;

    const { id } = settings;

    this.id = id instanceof VueAppDrawerControl ? id.id : id ?? Symbol();
    this.stackRef = this.stackRef.bind(this);

    this._position = computed(
      () => settings.position || VAL_DRAWER_DEFAULT_POSITION,
    );

    this._sticked = computed(() => {
      const { sticked } = settings;
      if (typeof sticked === 'object') {
        const {
          top = VAL_STACK_DEFAULT_POSITION_Y,
          bottom = VAL_STACK_DEFAULT_POSITION_Y,
        } = sticked;
        return { top, bottom };
      }

      const value: VueAppLayoutStickPositionY =
        sticked === true ? 'toolbar' : sticked || VAL_STACK_DEFAULT_POSITION_Y;
      return {
        top: value,
        bottom: value,
      };
    });

    this._static = computed(() => {
      const { static: isStatic } = settings;
      return typeof isStatic === 'function' ? isStatic() : isStatic || false;
    });

    this._rale = computed(() => {
      const { rale: isRale } = settings;
      return typeof isRale === 'function' ? isRale() : isRale || false;
    });

    this._backdrop = computed(() => settings.backdrop ?? true);

    watch(this._static, () => {
      this.setActive(this._static.value);
    });
  }

  /** @internal */
  stackRef(stackRef: any) {
    const stack = stackRef?.get() || null;
    if (this._stack.value !== stack) {
      this._stack.value = stack;
    }
  }

  setActive(active: boolean) {
    const { stack } = this;
    if (!stack || stack.active === active) return;
    stack.active = active;
  }

  open() {
    this.setActive(true);
  }

  close() {
    if (this.isStatic) return;
    this.setActive(false);
  }

  toggle() {
    return this.isActive ? this.close() : this.open();
  }
}

export class VueAppDrawerControl {
  readonly layout: VueAppLayout;
  readonly id: VueAppDrawerId;

  get isActive() {
    return this.get()?.isActive || false;
  }

  get isStatic() {
    return this.get()?.isStatic || false;
  }

  constructor(layout: VueAppLayout, id: VueAppDrawerId = Symbol()) {
    this.layout = layout;
    this.id = id;
  }

  get() {
    return this.layout.getDrawerById(this.id);
  }

  open() {
    return this.get()?.open();
  }

  close() {
    return this.get()?.close();
  }

  toggle() {
    return this.get()?.toggle();
  }
}
