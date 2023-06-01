import { defineComponent, h, cloneVNode } from 'vue';
import { useVueStack } from '../composables';
import { VStackControl } from '../schemes/control';
import { V_STACK_CONTAINER_ID } from '../injections';

export const VStackContainer = defineComponent({
  name: 'VStackContainer',
  setup(_props, ctx) {
    const $vstack = useVueStack();

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
        <div id={V_STACK_CONTAINER_ID} class="v-stack-container">
          {ctx.slots.default?.()}
          {$dynamicStacks}
        </div>
      );
    };
  },
});
