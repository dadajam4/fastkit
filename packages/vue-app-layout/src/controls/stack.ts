import { fadeTransition } from '../styles';
import { computed, ComputedRef, ref, Ref, watch, TransitionProps } from 'vue';
import type { VueAppLayout } from './layout';
import {
  VueAppLayoutStickPositionX,
  VueAppLayoutStickPositionY,
  VAL_STACK_DEFAULT_POSITION_X,
  VAL_STACK_DEFAULT_POSITION_Y,
} from '../schemes';
import { resolveFunctionableValue, FunctionableValue } from '@fastkit/helpers';

export type VueAppStackTransitionSettings = string | TransitionProps;

export interface VueAppStackBackdropSettings {
  color?: string;
  transition?: VueAppStackTransitionSettings;
  onClick?: (ev: MouseEvent) => any;
}

export interface VueAppStackResolvedBackdropSettings
  extends VueAppStackBackdropSettings {
  color?: string;
  transition: TransitionProps;
  onClick: (ev: MouseEvent) => any;
}

const resolveTransitionSettings = (
  settings: VueAppStackTransitionSettings = {},
): TransitionProps => {
  return typeof settings === 'string'
    ? { name: settings }
    : { name: fadeTransition, ...settings };
};

export type VueAppStackPositionX = FunctionableValue<
  VueAppLayoutStickPositionX,
  [VueAppLayout]
>;

export type VueAppStackPositionY = FunctionableValue<
  VueAppLayoutStickPositionY,
  [VueAppLayout]
>;

export interface VueAppStackPositionXSettings {
  /**
   * @default "window"
   *
   * @see {@link VAL_STACK_DEFAULT_POSITION_X}
   */
  left?: VueAppStackPositionX;
  /**
   * @default "window"
   *
   * @see {@link VAL_STACK_DEFAULT_POSITION_X}
   */
  right?: VueAppStackPositionX;
}

export interface VueAppStackPositionYSettings {
  /**
   * @default "window"
   *
   * @see {@link VAL_STACK_DEFAULT_POSITION_Y}
   */
  top?: VueAppStackPositionY;
  /**
   * @default "window"
   *
   * @see {@link VAL_STACK_DEFAULT_POSITION_Y}
   */
  bottom?: VueAppStackPositionY;
}

export interface VueAppStackPositionSettings
  extends VueAppStackPositionXSettings,
    VueAppStackPositionYSettings {}

export interface VueAppStackBaseSettings {
  transition?: VueAppStackTransitionSettings;
}

export interface VueAppStackSettings
  extends VueAppStackBaseSettings,
    VueAppStackPositionSettings {
  modelValue?: boolean;

  /**
   * Use a backdrop overlay
   */
  backdrop?: boolean | VueAppStackBackdropSettings;
}

export interface VueAppStackPositions {
  left: VueAppLayoutStickPositionX;
  right: VueAppLayoutStickPositionX;
  top: VueAppLayoutStickPositionY;
  bottom: VueAppLayoutStickPositionY;
}

export interface VueAppStackRef {
  get: () => VueAppStack;
}

export class VueAppStack {
  readonly layout: VueAppLayout;
  private _active: Ref<boolean>;
  private _transition: ComputedRef<TransitionProps>;
  private _backdrop: ComputedRef<
    VueAppStackResolvedBackdropSettings | undefined
  >;
  private _positions: ComputedRef<VueAppStackPositions>;
  private _emit: (modelValue: boolean) => void;

  get active() {
    return this._active.value;
  }

  set active(active) {
    if (this.active !== active) {
      // console.log(this._active);
      this._active.value = active;
      this._emit(active);
    }
  }

  get transition() {
    return this._transition.value;
  }

  get backdrop() {
    return this._backdrop.value;
  }

  get positions() {
    return this._positions.value;
  }

  get top() {
    return this.positions.top;
  }

  get bottom() {
    return this.positions.bottom;
  }

  get left() {
    return this.positions.left;
  }

  get right() {
    return this.positions.right;
  }

  constructor(
    layout: VueAppLayout,
    settings: VueAppStackSettings,
    emit: (modelValue: boolean) => void,
  ) {
    this.layout = layout;
    this._active = ref(settings.modelValue || false);
    this._emit = emit;

    this._transition = computed(() =>
      resolveTransitionSettings(settings.transition),
    );

    const defaultBackdropClickHandler = (ev: MouseEvent) => {
      this.active = false;
    };

    this._backdrop = computed(() => {
      let { backdrop } = settings;
      if (!backdrop) return;
      if (backdrop === true) {
        backdrop = {};
      }
      const resolved: VueAppStackResolvedBackdropSettings = {
        onClick: defaultBackdropClickHandler,
        ...backdrop,
        transition: resolveTransitionSettings(backdrop.transition),
      };

      return resolved;
    });

    const resolveFn = resolveFunctionableValue.build(layout);

    this._positions = computed(() => {
      const left = resolveFn(settings.left || VAL_STACK_DEFAULT_POSITION_X);
      const right = resolveFn(settings.left || VAL_STACK_DEFAULT_POSITION_X);
      const top = resolveFn(settings.top || VAL_STACK_DEFAULT_POSITION_Y);
      const bottom = resolveFn(settings.bottom || VAL_STACK_DEFAULT_POSITION_Y);
      return { left, right, top, bottom };
    });

    watch(
      () => settings.modelValue,
      (modelValue) => {
        this._active.value = modelValue || false;
      },
    );
  }
}
