import { reactive, onBeforeUnmount } from 'vue';
import { IN_WINDOW } from '@fastkit/helpers';

export interface WindowState {
  avairable: boolean;
  width: number;
  height: number;
}

export const state = reactive<WindowState>({
  avairable: IN_WINDOW,
  width: IN_WINDOW ? window.innerWidth : 0,
  height: IN_WINDOW ? window.innerHeight : 0,
});

export type WindowResizeHandler = (state: WindowState) => any;

export interface WindowResizeHandlerOptions {
  handler: WindowResizeHandler;
  debounce?: number;
  immediate?: boolean;
}

export type RawWindowResizeHandlerOptions =
  | WindowResizeHandler
  | WindowResizeHandlerOptions;

const resizeHandlers: WindowResizeHandler[] = [];

function updateRects() {
  if (IN_WINDOW) {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    for (const handler of resizeHandlers) {
      handler(state);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', updateRects, false);
  window.addEventListener('resize', updateRects, false);
}

export interface UseWindowRef {
  readonly avairable: boolean;
  readonly width: number;
  readonly height: number;
  onResize(
    rawWindowResizeHandlerOptions: RawWindowResizeHandlerOptions,
  ): () => void;
}

export function useWindow(): UseWindowRef {
  return {
    get avairable() {
      return state.avairable;
    },
    get width() {
      return state.width;
    },
    get height() {
      return state.height;
    },
    onResize(rawWindowResizeHandlerOptions) {
      let fn: WindowResizeHandler;
      let debounceTimerId: number | null = null;

      function clearDebounceTimer() {
        if (debounceTimerId !== null) {
          clearTimeout(debounceTimerId);
        }
        debounceTimerId = null;
      }

      const remover = () => {
        const index = resizeHandlers.indexOf(fn);
        if (index !== -1) {
          resizeHandlers.splice(index, 1);
        }
        clearDebounceTimer();
      };

      if (typeof rawWindowResizeHandlerOptions === 'function') {
        rawWindowResizeHandlerOptions = {
          handler: rawWindowResizeHandlerOptions,
        };
      }
      const { handler, debounce, immediate } = rawWindowResizeHandlerOptions;
      if (debounce) {
        fn = () => {
          clearDebounceTimer();
          debounceTimerId = window.setTimeout(() => {
            clearDebounceTimer();
            handler(state);
          }, debounce);
        };
      } else {
        fn = handler;
      }
      if (state.avairable) {
        resizeHandlers.push(fn);
      }
      onBeforeUnmount(remover);
      if (immediate) {
        handler(state);
      }
      return remover;
    },
  };
}
