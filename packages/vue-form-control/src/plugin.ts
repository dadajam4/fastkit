import { App } from 'vue';
import { VueFormService, VueFormServiceOptions } from './service';
import { onAppUnmount } from '@fastkit/vue-utils';
import { FormServiceInjectionKey } from './injections';

declare module 'vue' {
  export interface ComponentCustomProperties {
    $form: VueFormService;
  }
}

export class VueFormPlugin {
  static install(app: App, opts?: VueFormServiceOptions) {
    const $form = new VueFormService(opts);
    app.provide(FormServiceInjectionKey, $form);
    app.config.globalProperties.$form = $form;

    onAppUnmount(app, () => {
      delete (app.config.globalProperties as any).$form;
    });
  }
}

export function installVueFormPlugin(app: App, opts?: VueFormServiceOptions) {
  return app.use(VueFormPlugin, opts);
}
