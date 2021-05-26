import { CSSProperties } from '@fastkit/vue-utils';

export interface VStackMenuRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

export interface VStackMenuState {
  pageXOffset: number;
  pageYOffset: number;
  rect: VStackMenuRect | null;
  activatorRect: VStackMenuRect | null;
}

export interface VStackMenuControl {
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
  updatePageOffset(): void;
  updateMenuRect(): void;
  updateActivatorRect(): void;
  updateRects(): void;
}
