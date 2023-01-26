import { computed, ComputedRef } from 'vue';
import type { VueAppLayout } from './layout';
import { VueAppLayoutPositionY, VAL_BAR_DEFAULT_POSITION } from '../schemes';

export interface VueAppBarSettings {
  /**
   * @default "top"
   */
  position?: VueAppLayoutPositionY;
}

export class VueAppBar {
  readonly layout: VueAppLayout;
  private _position: ComputedRef<VueAppLayoutPositionY>;

  get position() {
    return this._position.value;
  }

  constructor(layout: VueAppLayout, settings: VueAppBarSettings) {
    this.layout = layout;
    this._position = computed(
      () => settings.position || VAL_BAR_DEFAULT_POSITION,
    );
  }
}
