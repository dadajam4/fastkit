import { defineComponent, h, cloneVNode } from 'vue';
import { useVueStack } from '../composables';
import { VStackControl } from '../schemes/control';

export const VDynamicStacks = defineComponent({
  name: 'VDynamicStacks',
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
        <>
          {ctx.slots.default?.()}
          {$dynamicStacks}
        </>
      );
    };
  },
});
