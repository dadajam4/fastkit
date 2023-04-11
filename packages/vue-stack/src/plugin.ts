import { App } from 'vue';
import {
  VueStackService,
  VueStackServiceOptions,
  VueStackInjectionKey,
} from './service';
import { onAppUnmount } from '@fastkit/vue-utils';

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $vstack: VueStackService;
  }
}

export class VueStackPlugin {
  static install(app: App, opts: VueStackServiceOptions) {
    const $vstack = new VueStackService(opts);
    app.provide(VueStackInjectionKey, $vstack);
    app.config.globalProperties.$vstack = $vstack;

    onAppUnmount(app, () => {
      delete (app.config.globalProperties as any).$vstack;
    });
  }
}

export function installVueStackPlugin(app: App, opts: VueStackServiceOptions) {
  return app.use(VueStackPlugin, opts);
}
