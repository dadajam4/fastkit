import { defineComponent } from 'vue';
import { createStackableDefine } from '../schemes';

import { useStackControl } from '../composables';

const { props, emits } = createStackableDefine();

export const VStack = defineComponent({
  name: 'VStack',
  inheritAttrs: false,
  props,
  emits,
  setup(props, ctx) {
    const stackControl = useStackControl(props, ctx);
    return () => stackControl.render((children) => <div>{children}</div>);
  },
});
