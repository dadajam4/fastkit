import { VuePageControl, VuePageControlSettings } from './page-control';
import { VuePageControlInjectionKey } from '../injections';

declare module 'vue' {
  export interface ComponentCustomProperties {
    $vpc: VuePageControl;
  }
}
export function installVuePageControl(settings: VuePageControlSettings) {
  const pageControl = new VuePageControl(settings);
  settings.app.provide(VuePageControlInjectionKey, pageControl);
  settings.app.config.globalProperties.$vpc = pageControl;
  return pageControl;
}
