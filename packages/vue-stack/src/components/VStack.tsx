import { defineComponent } from 'vue';
import { createStackableDefine, V_STACK_SLOTS } from '../schemes';

import { useStackControl } from '../composables';

const { props, emits } = createStackableDefine();

export const VStack = defineComponent({
  name: 'VStack',
  inheritAttrs: false,
  props,
  emits,
  slots: V_STACK_SLOTS,
  setup(_props, ctx) {
    const stackControl = useStackControl(_props, ctx);
    return () => stackControl.render((children) => <div>{children}</div>);
  },
});
