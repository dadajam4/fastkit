import { computed, ComputedRef } from 'vue';
import type { VueAppLayout } from './layout';
import { VueAppLayoutPositionY, VAL_BAR_DEFAULT_POSITION } from '../schemes';

export type VueAppBarActivateCondition =
  | boolean
  | ((layout: VueAppLayout) => boolean);

export interface VueAppBarSettings {
  /**
   * @default "top"
   */
  position?: VueAppLayoutPositionY;
  /**
   * @default true
   */
  active?: VueAppBarActivateCondition;
}

export class VueAppBar {
  readonly layout: VueAppLayout;
  private _position: ComputedRef<VueAppLayoutPositionY>;
  private _active: ComputedRef<boolean>;

  get position() {
    return this._position.value;
  }

  get isActive() {
    return this._active.value;
  }

  constructor(layout: VueAppLayout, settings: VueAppBarSettings) {
    this.layout = layout;
    this._active = computed(() => {
      const { active } = settings;
      return typeof active === 'function' ? active(layout) : active ?? true;
    });
    this._position = computed(
      () => settings.position || VAL_BAR_DEFAULT_POSITION,
    );
  }
}
