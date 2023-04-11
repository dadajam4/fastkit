import { App } from 'vue';
import { VueColorSchemeServiceSettings, ThemeName } from './types';
import { VueColorSchemeService } from './service';

export interface VueColorSchemePluginSettings
  extends Omit<VueColorSchemeServiceSettings, 'defaultTheme'> {
  defaultTheme?: ThemeName;
}

export class VueColorSchemePlugin {
  readonly settings: VueColorSchemeServiceSettings;

  constructor(settings: VueColorSchemePluginSettings) {
    let { defaultTheme } = settings;
    if (!defaultTheme) {
      defaultTheme = settings.themeNames[0];
    }
    this.settings = {
      ...settings,
      defaultTheme,
    };
  }

  install(app: App) {
    const $color = new VueColorSchemeService(this.settings);
    $color.provide(app);
  }
}
