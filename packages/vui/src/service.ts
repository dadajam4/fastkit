export { VuiInjectionKey } from './injections';

import { VNodeChild } from 'vue';
import { ScopeName } from '@fastkit/color-scheme';
import type { IconName } from '@fastkit/icon-font';
import { VueColorSchemePluginSettings } from '@fastkit/vue-kit';

const DEFAULT_AUTO_SCROLL_TO_ELEMENT_OFFSET_TOP = -20;
const DEFAULT_TEXTAREA_ROWS = 3;

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
  autoScrollToElementOffsetTop?: number | (() => number | undefined);
  textareaRows?: number;
  requiredChip?: VuiVNodeResolver;
}

export class VuiService {
  readonly options: VuiServiceOptions;

  readonly selectionSeparator: VuiVNodeResolver;
  readonly autoScrollToElementOffsetTop?: number | (() => number | undefined);
  readonly textareaRows?: number;
  readonly requiredChip?: VuiVNodeResolver;

  constructor(options: VuiServiceOptions) {
    this.options = options;
    const {
      selectionSeparator = () => ', ',
      autoScrollToElementOffsetTop = DEFAULT_AUTO_SCROLL_TO_ELEMENT_OFFSET_TOP,
      textareaRows = DEFAULT_TEXTAREA_ROWS,
      requiredChip = () => '*',
    } = options;
    this.selectionSeparator = selectionSeparator;
    this.autoScrollToElementOffsetTop = autoScrollToElementOffsetTop;
    this.textareaRows = textareaRows;
    this.requiredChip = requiredChip;
  }

  color(colorType: keyof VuiServiceColorSettings): ScopeName {
    return this.options.colors[colorType];
  }

  icon(iconType: keyof VuiServiceIconSettings): IconName {
    return this.options.icons[iconType];
  }

  getAutoScrollToElementOffsetTop() {
    let { autoScrollToElementOffsetTop } = this;
    if (typeof autoScrollToElementOffsetTop === 'function') {
      autoScrollToElementOffsetTop = autoScrollToElementOffsetTop();
    }
    return autoScrollToElementOffsetTop || 0;
  }

  getRequiredChip() {
    const { requiredChip } = this;
    return requiredChip && requiredChip();
  }
}
