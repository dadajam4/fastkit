import { InjectionKey, inject, onBeforeUnmount } from 'vue';
import type { VuePageControl, UseVuePageControlOptions } from './composables';
import { VuePageError } from './logger';

export const VuePageControlInjectionKey: InjectionKey<VuePageControl> =
  Symbol();

export function useVuePageControl(opts: UseVuePageControlOptions = {}) {
  const pageControl = inject(VuePageControlInjectionKey, null);
  if (!pageControl) {
    throw new VuePageError(`missing provided VuePageControl.`);
  }

  const { onStart, onFinish, onError } = opts;
  if (onStart || onFinish) {
    onStart && pageControl.on('start', onStart);
    onFinish && pageControl.on('finish', onFinish);
    onError && pageControl.on('error', onError);

    onBeforeUnmount(() => {
      onStart && pageControl.off('start', onStart);
      onFinish && pageControl.off('finish', onFinish);
      onError && pageControl.off('error', onError);
    });
  }
  return pageControl;
}
