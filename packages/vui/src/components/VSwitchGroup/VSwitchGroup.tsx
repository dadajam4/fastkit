import { VUI_SWITCH_GROUP_SYMBOL } from '../../injections';
import { VSwitch } from '../VSwitch';
import { defineFormSelectorComponent } from '../../composables';

export const VSwitchGroup = defineFormSelectorComponent({
  name: 'VSwitchGroup',
  defaultMultiple: true,
  nodeType: VUI_SWITCH_GROUP_SYMBOL,
  className: 'v-switch-group',
  itemRenderer: ({ attrs, slots }) => <VSwitch {...attrs}>{slots}</VSwitch>,
});
