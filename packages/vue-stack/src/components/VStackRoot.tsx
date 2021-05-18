import './VStackRoot.scss';

import { defineComponent, ref, Ref, InjectionKey, provide } from 'vue';

export interface VStackRootControl {
  root: Ref<HTMLElement | null>;
}

export const VStackRootInjectKey: InjectionKey<VStackRootControl> = Symbol();

export const VStackRoot = defineComponent({
  name: 'VStackRoot',
  setup(props, ctx) {
    const { default: defaultSlot } = ctx.slots;
    const root = ref<HTMLElement | null>(null);
    const control: VStackRootControl = {
      root,
    };
    provide(VStackRootInjectKey, control);
    return () => (
      <div class="v-stack-root" ref={root}>
        {defaultSlot && defaultSlot()}
      </div>
    );
  },
});
