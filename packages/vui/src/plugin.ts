import { App } from 'vue';
import { VuiService, VuiServiceOptions, VuiInjectionKey } from './service';
import {
  installVueStackPlugin,
  VueStackServiceOptions,
  VueColorSchemePlugin,
} from '@fastkit/vue-kit';

// buttonDefaultScope: ScopeName;
// buttonDefaultVariant: ColorVariant;

export interface VuiPluginStackOptions
  extends Omit<
    VueStackServiceOptions,
    'primaryColor' | 'buttonDefaultScope' | 'buttonDefaultVariant'
  > {
  primaryColor?: VueStackServiceOptions['primaryColor'];
  buttonDefaultScope?: VueStackServiceOptions['buttonDefaultScope'];
  buttonDefaultVariant?: VueStackServiceOptions['buttonDefaultVariant'];
}

export interface VuiPluginOptions extends VuiServiceOptions {
  stack?: VuiPluginStackOptions;
}

export class VuiPlugin {
  static readonly installedApps = new Set<App>();

  static install(app: App, opts: VuiPluginOptions) {
    const { installedApps } = this;
    if (installedApps.has(app)) return;
    const unmountApp = app.unmount;
    installedApps.add(app);

    const { colors, colorVariants, colorScheme, stack } = opts;

    // ColorScheme
    const vueColorSchemePlugin = new VueColorSchemePlugin(colorScheme);
    app.use(vueColorSchemePlugin);

    // Stack
    installVueStackPlugin(app, {
      primaryColor: colors.primary,
      buttonDefaultScope: colors.buttonDefault,
      buttonDefaultVariant: colorVariants.buttonDefault,
      ...stack,
    });

    // Vui
    const $vui = new VuiService(opts);
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
