export { VuiInjectionKey } from './injections';

import { VNodeChild } from 'vue';
import { ScopeName } from '@fastkit/color-scheme';
import type { IconName } from '@fastkit/icon-font';
import { VueColorSchemePluginSettings } from '@fastkit/vue-color-scheme';

export interface VuiServiceColorSettings {
  primary: ScopeName;
  error: ScopeName;
}

export interface VuiServiceIconSettings {
  menuDown: IconName;
}

export type VuiVNodeResolver = () => VNodeChild;

export interface VuiServiceOptions {
  colorScheme: VueColorSchemePluginSettings;
  colors: VuiServiceColorSettings;
  icons: VuiServiceIconSettings;
  selectionSeparator?: VuiVNodeResolver;
}

export class VuiService {
  readonly options: VuiServiceOptions;

  readonly selectionSeparator: VuiVNodeResolver;

  constructor(options: VuiServiceOptions) {
    this.options = options;
    this.selectionSeparator = options.selectionSeparator || (() => ', ');
  }

  color(colorType: keyof VuiServiceColorSettings) {
    return this.options.colors[colorType];
  }

  icon(iconType: keyof VuiServiceIconSettings) {
    return this.options.icons[iconType];
  }
}
