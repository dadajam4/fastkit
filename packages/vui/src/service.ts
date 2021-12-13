export { VuiInjectionKey } from './injections';

import { VNodeChild } from 'vue';
import { ScopeName, ColorVariant } from '@fastkit/color-scheme';
import type { IconName, RawIconProp } from './components/VIcon';
import type { VueColorSchemePluginSettings } from '@fastkit/vue-kit';
import type { Router } from 'vue-router';
import { RouterLink } from 'vue-router';
import { LocationService, setDefaultRouterLink } from '@fastkit/vue-utils';

const DEFAULT_AUTO_SCROLL_TO_ELEMENT_OFFSET_TOP = -20;
const DEFAULT_TEXTAREA_ROWS = 3;

export interface VuiServiceUISettings {
  primaryScope: ScopeName;
  plainVariant: ColorVariant;
  containedVariant: ColorVariant;
  errorScope: ScopeName;
  buttonDefault: {
    color: ScopeName;
    variant: ColorVariant;
  };
  tabDefault: {
    color: ScopeName;
  };
  dialogOk?: {
    color?: ScopeName;
    variant?: ColorVariant;
  };
  dialogCancel?: {
    color?: ScopeName;
    variant?: ColorVariant;
  };
  dialogClose?: {
    color?: ScopeName;
    variant?: ColorVariant;
  };
}

export interface VuiServiceIconSettings {
  menuDown: IconName;
  navigationExpand: RawIconProp;
  prev: RawIconProp;
  next: RawIconProp;
  sort: RawIconProp;
}

export type VuiVNodeResolver = () => VNodeChild;

export interface VuiServiceOptions {
  router: Router;
  RouterLink?: typeof RouterLink;
  colorScheme: VueColorSchemePluginSettings;
  uiSettings: VuiServiceUISettings;
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
  readonly router: Router;
  readonly location: LocationService;

  constructor(options: VuiServiceOptions) {
    this.options = options;
    this.configure();

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
    this.router = options.router;
    this.location = new LocationService({
      router: this.router,
    });
  }

  configure(options?: Partial<VuiServiceOptions>) {
    options && Object.assign(this.options, options);
    setDefaultRouterLink(this.getRouterLink());
  }

  getRouterLink() {
    return this.options.RouterLink || RouterLink;
  }

  setting<K extends keyof VuiServiceUISettings>(
    key: K,
  ): VuiServiceUISettings[K] {
    return this.options.uiSettings[key] as VuiServiceUISettings[K];
  }

  icon<K extends keyof VuiServiceIconSettings>(
    iconType: K,
  ): VuiServiceIconSettings[K] {
    return this.options.icons[iconType] as VuiServiceIconSettings[K];
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
