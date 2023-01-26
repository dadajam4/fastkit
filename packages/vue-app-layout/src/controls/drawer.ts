import { ref, computed, ComputedRef, Ref, watch } from 'vue';
import type { VueAppLayout } from './layout';
import type { VueAppStack, VueAppStackBaseSettings } from './stack';
import {
  VueAppLayoutPositionX,
  VueAppLayoutPositionY,
  VAL_DRAWER_DEFAULT_POSITION,
  VueAppLayoutStickPositionY,
  VueAppDrawerId,
} from '../schemes';
import { VueAppStackPositionYSettings } from './stack';
import { resolveFunctionableValue } from '@fastkit/helpers';

export type VueAppDrawerStaticCondition = boolean | (() => boolean);

export type VueAppDrawerResolvedStickedSettings = Record<
  VueAppLayoutPositionY,
  VueAppLayoutStickPositionY
>;

export type VueAppDrawerStickedSettings =
  | boolean
  | VueAppLayoutStickPositionY
  | Partial<VueAppDrawerResolvedStickedSettings>;

export interface VueAppDrawerSettings
  extends VueAppStackBaseSettings,
    VueAppStackPositionYSettings {
  id?: VueAppDrawerId | VueAppDrawerControl;
  /**
   * @default "left"
   */
  position?: VueAppLayoutPositionX;
  static?: VueAppDrawerStaticCondition;
  backdrop?: boolean;
}

export class VueAppDrawer {
  readonly layout: VueAppLayout;
  private _stack: Ref<VueAppStack | null> = ref(null);
  readonly id: VueAppDrawerId;
  private _position: ComputedRef<VueAppLayoutPositionX>;
  private _static: ComputedRef<boolean>;
  private _backdrop: ComputedRef<boolean>;
  private _top: ComputedRef<VueAppLayoutStickPositionY>;
  private _bottom: ComputedRef<VueAppLayoutStickPositionY>;

  get stack() {
    return this._stack.value;
  }

  get isActive() {
    return this.stack?.active || false;
  }

  get position() {
    return this._position.value;
  }

  get top() {
    return this._top.value;
  }

  get bottom() {
    return this._bottom.value;
  }

  get isStatic() {
    return this._static.value;
  }

  get hasBackdrop() {
    return this._backdrop.value && !this.isStatic;
  }

  constructor(layout: VueAppLayout, settings: VueAppDrawerSettings) {
    this.layout = layout;

    const { id } = settings;

    this.id = id instanceof VueAppDrawerControl ? id.id : id ?? Symbol();
    this.stackRef = this.stackRef.bind(this);
    const resolveLayoutValue = resolveFunctionableValue.build(layout);

    this._position = computed(
      () => settings.position || VAL_DRAWER_DEFAULT_POSITION,
    );

    const resolveStickedPosition = (stickPosition: 'top' | 'bottom') =>
      resolveLayoutValue(settings.top || 'systemBar');

    this._top = computed(() => resolveStickedPosition('top'));
    this._bottom = computed(() => resolveStickedPosition('bottom'));
    this._static = computed(() => {
      const { static: isStatic } = settings;
      return typeof isStatic === 'function' ? isStatic() : isStatic || false;
    });
    this._backdrop = computed(() => settings.backdrop ?? true);

    watch(this._static, () => {
      this.close();
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
