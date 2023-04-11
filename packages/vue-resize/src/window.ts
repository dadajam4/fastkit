import { reactive } from 'vue';
import { IN_WINDOW } from '@fastkit/helpers';

export interface WindowState {
  available: boolean;
  width: number;
  height: number;
}

export const state = reactive<WindowState>({
  available: IN_WINDOW,
  width: IN_WINDOW ? window.innerWidth : 0,
  height: IN_WINDOW ? window.innerHeight : 0,
});

export type WindowResizeHandler = (state: WindowState) => any;

function updateRects() {
  if (IN_WINDOW) {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', updateRects, false);
  window.addEventListener('resize', updateRects, false);
}

export interface UseWindowRef {
  readonly available: boolean;
  readonly width: number;
  readonly height: number;
}

export function useWindow(): UseWindowRef {
  return {
    get available() {
      return state.available;
    },
    get width() {
      return state.width;
    },
    get height() {
      return state.height;
    },
  };
}
