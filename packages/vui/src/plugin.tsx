import { App } from 'vue';
import {
  installVueStackPlugin,
  VueStackServiceOptions,
} from '@fastkit/vue-stack';
import {
  installVueFormPlugin,
  VueFormServiceOptions,
} from '@fastkit/vue-form-control';
import { installBodyScrollLockDirective } from '@fastkit/vue-body-scroll-lock';
import { installClickOutsideDirective } from '@fastkit/vue-click-outside';
import { installResizeDirective } from '@fastkit/vue-resize';
import { VueColorSchemePlugin } from '@fastkit/vue-color-scheme';
import { installVueAppLayout } from '@fastkit/vue-app-layout';
import { onAppUnmount } from '@fastkit/vue-utils';
import { getDocumentScroller } from '@fastkit/vue-scroller';
import { setDefaultActionableClassName } from '@fastkit/vue-action';
import {
  VuiService,
  VuiServiceOptions,
  RawVuiServiceOptions,
  mergeVuiServiceOptions,
  VuiInjectionKey,
} from './service';

setDefaultActionableClassName('clickable');
const scroller = getDocumentScroller();

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VuiPluginStackOptions extends VueStackServiceOptions {}

export interface VuiPluginOptions extends VuiServiceOptions {
  stack?: VuiPluginStackOptions;
  form?: VueFormServiceOptions;
}

export interface RawVuiPluginOptions extends RawVuiServiceOptions {
  stack?: VuiPluginStackOptions;
  form?: VueFormServiceOptions;
}

export function mergeVuiPluginOptions(
  base: VuiPluginOptions,
  override?: RawVuiPluginOptions,
): VuiPluginOptions {
  if (!override) return base;
  const merged: VuiPluginOptions = mergeVuiServiceOptions(base, override);
  if (override.stack) {
    merged.stack = {
      ...merged.stack,
      ...override.stack,
    };
  }
  if (override.form) {
    merged.form = {
      ...merged.form,
      ...override.form,
    };
  }
  return merged;
}

declare module 'vue' {
  export interface ComponentCustomProperties {
    $vui: VuiService;
  }
}

export class VuiPlugin {
  static install(app: App, opts: VuiPluginOptions) {
    const { colorScheme, stack, form } = opts;

    // ColorScheme
    const vueColorSchemePlugin = new VueColorSchemePlugin(colorScheme);
    app.use(vueColorSchemePlugin);

    installVueStackPlugin(app, stack);
    installVueFormPlugin(app, {
      scroll: {
        options: {
          behavior: 'smooth',
        },
        // eslint-disable-next-line no-shadow
        fn: (el, opts) => {
          if (window.getComputedStyle(el).scrollMargin) return;
          const duration = opts?.behavior === 'smooth' ? undefined : 0;
          return scroller.toElement(el, {
            offset: $vui.getAutoScrollToElementOffsetTop(),
            duration,
          });
        },
      },
      ...form,
    });
    installVueAppLayout(app);
    installBodyScrollLockDirective(app);
    installClickOutsideDirective(app);
    installResizeDirective(app);

    // Vui
    const $vui = new VuiService(opts, app.config.globalProperties.$vstack);
    app.provide(VuiInjectionKey, $vui);
    app.config.globalProperties.$vui = $vui;

    onAppUnmount(app, () => {
      delete (app.config.globalProperties as any).$vui;
    });
  }
}

export function installVuiPlugin(app: App, opts: VuiPluginOptions) {
  return app.use(VuiPlugin, opts);
}
