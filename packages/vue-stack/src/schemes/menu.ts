import { CSSProperties } from '@fastkit/vue-utils';
import { Ref } from 'vue';
import type { ResizeDirectivePayload } from '@fastkit/vue-resize';

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

export interface VMenuControl {
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
