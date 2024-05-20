import { type MaybeRefOrGetter } from 'vue';

/**
 * Loading display options
 */
export interface LoadingDisplayOptions {
  /**
   * Show an overlay
   *
   * When the overlay is displayed, document scrolling is locked
   *
   * @default true
   */
  backdrop?: MaybeRefOrGetter<boolean>;
  /**
   * Delay the start of the loading display (milliseconds)
   *
   * @default 0
   */
  delay?: number;
  /**
   * End the loading display when route navigation (vue-router) is completed
   *
   * @default true
   */
  endOnNavigation?: boolean;
}

/**
 * Loading display settings
 */
export interface LoadingDisplaySettings {
  /**
   * Show an overlay
   *
   * When the overlay is displayed, document scrolling is locked
   */
  backdrop: boolean;
}
