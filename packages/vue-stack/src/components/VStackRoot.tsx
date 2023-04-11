import './VStackRoot.scss';

import {
  defineComponent,
  ref,
  Ref,
  provide,
  h,
  cloneVNode,
  onMounted,
} from 'vue';
import { useVueStack } from '../composables';
import { VStackControl } from '../schemes/control';
import { normalizeVStackDynamicChildren } from '../schemes/dynamic';
import { VStackRootInjectKey } from '../injections';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';

export interface VStackRootControl {
  root: Ref<HTMLElement | null>;
}

export const VStackRoot = defineComponent({
  name: 'VStackRoot',
  setup(props, ctx) {
    const $vstack = useVueStack();
    const rootRef = ref<HTMLElement | null>(null);
    const booted = ref(false);
    const control: VStackRootControl = {
      root: rootRef,
    };

    onMounted(() => {
      booted.value = true;
    });

    provide(VStackRootInjectKey, control);
    return {
      get settings() {
        return $vstack.dynamicSettings;
      },
      rootRef() {
        return rootRef;
      },
      booted,
    };
    // return () => (
    //   <div class="v-stack-root" ref={root}>
    //     {defaultSlot && defaultSlot()}
    //     {$dynamicStacks}
    //   </div>
    // );
  },
  render() {
    const { settings, $slots } = this;

    const $dynamicStacks = settings.map(
      ({ id: key, setting, resolve, remove }) => {
        const { Ctor, props, children } = setting;
        const $children = normalizeVStackDynamicChildren(children);
        const node = cloneVNode(
          h(
            Ctor,
            {
              ...props,
              key,
            },
            $children,
            // {
            //   default: $children,
            // },
          ),
          {
            onClose: (control: VStackControl) => {
              resolve(control.value);
            },
            onAfterLeave: () => {
              remove();
            },
          },
        );
        return node;
      },
    );

    return (
      <div class="v-stack-root" ref={this.rootRef()}>
        {renderSlotOrEmpty($slots, 'default')}
        {$dynamicStacks}
      </div>
    );
  },
});
