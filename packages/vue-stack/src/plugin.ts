import { App } from 'vue';
import {
  VueStackService,
  VueStackServiceOptions,
  VueStackInjectionKey,
} from './service';

export class VueStackPlugin {
  static readonly installedApps = new Set<App>();

  static install(app: App, opts: VueStackServiceOptions) {
    const { installedApps } = this;
    if (installedApps.has(app)) return;
    const unmountApp = app.unmount;
    installedApps.add(app);

    const $vstack = new VueStackService(opts);
    app.provide(VueStackInjectionKey, $vstack);

    app.unmount = function () {
      installedApps.delete(app);
      delete app.config.globalProperties.$vstack;
      unmountApp();
    };
  }
}

export function installVueStackPlugin(app: App, opts: VueStackServiceOptions) {
  return app.use(VueStackPlugin, opts);
}
