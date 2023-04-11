import { InjectionKey, inject, computed, provide } from 'vue';
import type { VuiService } from './service';
import type {
  ControlProvider,
  ControlFieldProvider,
  VuiColorProvider,
} from './composables';

export const VuiInjectionKey: InjectionKey<VuiService> = Symbol();

export const VuiControlInjectionKey: InjectionKey<ControlProvider> = Symbol();

export const VuiControlFieldInjectionKey: InjectionKey<ControlFieldProvider> =
  Symbol();

export const VuiColorProviderInjectionKey: InjectionKey<VuiColorProvider> =
  Symbol();

export const VUI_TEXT_FIELD_SYMBOL = 'vui-text-field';
export const VUI_TEXTAREA_SYMBOL = 'vui-textarea';
// export const VUI_WYSIWYG_EDITOR_SYMBOL = 'vui-wysiwyg-editor';
export const VUI_SELECT_SYMBOL = 'vui-select';
export const VUI_OPTION_SYMBOL = 'vui-option';
export const VUI_CHECKBOX_GROUP_SYMBOL = 'vui-checkbox-group';
export const VUI_CHECKBOX_SYMBOL = 'vui-checkbox';
export const VUI_RADIO_GROUP_SYMBOL = 'vui-radio-group';
export const VUI_RADIO_SYMBOL = 'vui-radio';
export const VUI_SWITCH_GROUP_SYMBOL = 'vui-switch-group';
export const VUI_SWITCH_SYMBOL = 'vui-switch';
export const VUI_FORM_SYMBOL = 'vui-form';

export function useVui() {
  const vui = inject(VuiInjectionKey);
  if (!vui) {
    throw new Error('missing vui service');
  }
  return vui;
}

export function useVuiColorProvider(): VuiColorProvider {
  const parent = inject(VuiColorProviderInjectionKey, null);
  if (parent) {
    return parent;
  }

  const vui = useVui();
  const primary = computed(() => vui.setting('primaryScope'));
  const error = computed(() => vui.setting('errorScope'));
  const provider: VuiColorProvider = {
    primary,
    error,
    className: (type) => {
      const scope = provider[type].value;
      return `${scope}-scope`;
    },
  };

  provide(VuiColorProviderInjectionKey, provider);

  return provider;
}
