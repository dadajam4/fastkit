import { ref, Ref } from 'vue';
import {
  ThemeName,
  ScopeName,
  PaletteName,
  VueColorSchemePluginSettings,
} from './types';

export class VueColorSchemeService {
  private _rootTheme: Ref<ThemeName>;

  readonly defaultTheme: ThemeName;
  readonly themeNames: readonly ThemeName[];
  readonly scopeNames: readonly ScopeName[];
  readonly paletteNames: readonly PaletteName[];

  get rootTheme() {
    return this._rootTheme.value;
  }

  set rootTheme(rootTheme) {
    this._rootTheme.value = rootTheme;
  }

  constructor(settings: VueColorSchemePluginSettings) {
    this._rootTheme = ref<ThemeName>(settings.defaultTheme);
    this.defaultTheme = settings.defaultTheme;
    this.themeNames = settings.themeNames;
    this.scopeNames = settings.scopeNames;
    this.paletteNames = settings.paletteNames;
  }
}
