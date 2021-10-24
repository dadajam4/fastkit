import { VUI_CHECKBOX_GROUP_SYMBOL } from '../../injections';
import { VCheckbox } from '../VCheckbox';
import { defineFormSelectorComponent } from '../../composables';

export const VCheckboxGroup = defineFormSelectorComponent({
  name: 'VCheckboxGroup',
  defaultMultiple: true,
  nodeType: VUI_CHECKBOX_GROUP_SYMBOL,
  className: 'v-checkbox-group',
  itemRenderer: ({ attrs, slots }) => <VCheckbox {...attrs}>{slots}</VCheckbox>,
});
