import { App } from 'vue';
import {
  RawVueColorSchemePluginSettings,
  VueColorSchemePluginSettings,
} from './types';
import { VueColorSchemeInjectionKey } from './injections';

import { VueColorSchemeService } from './service';

export class VueColorSchemePlugin {
  readonly installedApps = new Set<App>();
  readonly settings: VueColorSchemePluginSettings;

  constructor(settings: RawVueColorSchemePluginSettings) {
    const {
      defaultTheme: _defaultTheme,
      themeNames,
      scopeNames,
      paletteNames,
    } = settings;
    const defaultTheme = _defaultTheme || themeNames[0];
    this.settings = {
      defaultTheme,
      themeNames,
      scopeNames,
      paletteNames,
    };
  }

  install(app: App) {
    const { installedApps } = this;
    if (installedApps.has(app)) return;
    const unmountApp = app.unmount;
    installedApps.add(app);

    const $color = new VueColorSchemeService(this.settings);

    app.provide(VueColorSchemeInjectionKey, $color);

    app.unmount = function () {
      installedApps.delete(app);
      unmountApp();
    };
  }
}
