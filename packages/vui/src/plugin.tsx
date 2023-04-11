import { App } from 'vue';
import {
  VuiService,
  VuiServiceOptions,
  RawVuiServiceOptions,
  mergeVuiServiceOptions,
  VuiInjectionKey,
} from './service';
import {
  installVueStackPlugin,
  VueStackServiceOptions,
} from '@fastkit/vue-stack';
import { installBodyScrollLockDirective } from '@fastkit/vue-body-scroll-lock';
import { installClickOutsideDirective } from '@fastkit/vue-click-outside';
import { installResizeDirective } from '@fastkit/vue-resize';
import { VueColorSchemePlugin } from '@fastkit/vue-color-scheme';
import { installVueAppLayout } from '@fastkit/vue-app-layout';
import { onAppUnmount } from '@fastkit/vue-utils';
import { VButton } from './components/VButton';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VuiPluginStackOptions extends VueStackServiceOptions {}

export interface VuiPluginOptions extends VuiServiceOptions {
  stack?: VuiPluginStackOptions;
}

export interface RawVuiPluginOptions extends RawVuiServiceOptions {
  stack?: VuiPluginStackOptions;
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
  return merged;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $vui: VuiService;
  }
}

export class VuiPlugin {
  static install(app: App, opts: VuiPluginOptions) {
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
