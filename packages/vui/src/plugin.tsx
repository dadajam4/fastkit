import { App } from 'vue';
import { VuiService, VuiServiceOptions, VuiInjectionKey } from './service';
import {
  installVueStackPlugin,
  VueStackServiceOptions,
  VueColorSchemePlugin,
} from '@fastkit/vue-kit';
import { VButton } from './components/VButton';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VuiPluginStackOptions extends VueStackServiceOptions {}

export interface VuiPluginOptions extends VuiServiceOptions {
  stack?: VuiPluginStackOptions;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $vui: VuiService;
  }
}

export class VuiPlugin {
  static readonly installedApps = new Set<App>();

  static install(app: App, opts: VuiPluginOptions) {
    const { installedApps } = this;
    if (installedApps.has(app)) return;
    const unmountApp = app.unmount;
    installedApps.add(app);

    const { colorScheme, stack, uiSettings } = opts;

    // ColorScheme
    const vueColorSchemePlugin = new VueColorSchemePlugin(colorScheme);
    app.use(vueColorSchemePlugin);

    // Stack
    installVueStackPlugin(app, {
      actions: {
        ok: ({ bindings }) => (
          <VButton {...uiSettings.dialogOk} {...bindings}>
            OK
          </VButton>
        ),
        cancel: ({ bindings }) => (
          <VButton {...uiSettings.dialogCancel} {...bindings}>
            CANCEL
          </VButton>
        ),
        close: ({ bindings }) => (
          <VButton {...uiSettings.dialogClose} {...bindings}>
            CLOSE
          </VButton>
        ),
        ...(stack ? stack.actions : {}),
      },
      ...stack,
    });

    // Vui
    const $vui = new VuiService(opts, app.config.globalProperties.$vstack);
    app.provide(VuiInjectionKey, $vui);
    app.config.globalProperties.$vui = $vui;

    app.unmount = function () {
      installedApps.delete(app);
      delete app.config.globalProperties.$vui;
      unmountApp();
    };
  }
}

export function installVuiPlugin(app: App, opts: VuiPluginOptions) {
  return app.use(VuiPlugin, opts);
}
