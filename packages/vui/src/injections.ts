import { InjectionKey } from 'vue';
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
export const VUI_SELECT_SYMBOL = 'vui-select';
export const VUI_OPTION_SYMBOL = 'vui-option';
export const VUI_CHECKBOX_GROUP_SYMBOL = 'vui-checkbox-group';
export const VUI_CHECKBOX_SYMBOL = 'vui-checkbox';
export const VUI_RADIO_GROUP_SYMBOL = 'vui-radio-group';
export const VUI_RADIO_SYMBOL = 'vui-radio';
export const VUI_SWITCH_GROUP_SYMBOL = 'vui-switch-group';
export const VUI_SWITCH_SYMBOL = 'vui-switch';
export const VUI_FORM_SYMBOL = 'vui-form';
