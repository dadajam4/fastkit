import { VuePageControl, VuePageControlSettings } from './page-control';
import { VuePageControlInjectionKey } from '../injections';

export function installVuePageControl(settings: VuePageControlSettings) {
  const pageControl = new VuePageControl(settings);
  settings.app.provide(VuePageControlInjectionKey, pageControl);
  return pageControl;
}
