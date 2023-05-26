import './VStackRoot.scss';

import { defineComponent, ref, Ref, provide, h, cloneVNode } from 'vue';
import { useVueStack } from '../composables';
import { VStackControl } from '../schemes/control';
import { VStackRootInjectKey } from '../injections';

export interface VStackRootControl {
  root: Ref<HTMLElement | null>;
}

export const VStackRoot = defineComponent({
  name: 'VStackRoot',
  setup(_props, ctx) {
    const $vstack = useVueStack();
    const rootRef = ref<HTMLElement | null>(null);
    const control: VStackRootControl = {
      root: rootRef,
    };

    provide(VStackRootInjectKey, control);

    return () => {
      const { dynamicSettings: settings } = $vstack;

      const $dynamicStacks = settings.map(
        ({ id: key, setting, resolve, remove }) => {
          const { Ctor, props, slots } = setting;
          const node = cloneVNode(
            h(
              Ctor,
              {
                ...props,
                key,
              },
              slots,
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
        <div class="v-stack-root" ref={rootRef}>
          {ctx.slots.default?.()}
          {$dynamicStacks}
        </div>
      );
    };
  },
});
