import { VUI_RADIO_GROUP_SYMBOL } from '../../injections';
import { VRadio } from '../VRadio';
import { defineFormSelectorComponent } from '../../composables';

export const VRadioGroup = defineFormSelectorComponent({
  name: 'VRadioGroup',
  nodeType: VUI_RADIO_GROUP_SYMBOL,
  className: 'v-radio-group',
  itemRenderer: ({ attrs, slots }) => <VRadio {...attrs}>{slots}</VRadio>,
});
