import './VCard.scss';
import { defineComponent, computed } from 'vue';
import { actionableInheritProps, VAction } from '@fastkit/vue-action';

// @TODO Unable to resolve dts for `actionableInheritProps`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RouteLocationRaw } from 'vue-router';
import { VPaper, createPaperProps } from '../VPaper';

export function createCardProps() {
  return {
    ...createPaperProps(),
    ...actionableInheritProps,
    disabled: Boolean,
  };
}

export const VCard = defineComponent({
  name: 'VCard',
  inheritAttrs: false,
  props: createCardProps(),
  setup(props, ctx) {
    const _props = computed(() => props);
    const data = computed(() => {
      const attrs = {
        ..._props.value,
        ...ctx.attrs,
        class: ['v-card', ctx.attrs.class],
        tag: VAction,
        linkFallbackTag: 'div',
      };
      if (props.disabled) {
        attrs.disabled = 'disabled' as any;
        delete (attrs as any).onClick;
        delete (attrs as any).href;
        delete (attrs as any).to;
      } else {
        delete (attrs as any).disabled;
      }
      return { attrs };
    });

    return () => <VPaper {...data.value.attrs} v-slots={ctx.slots} />;
  },
});
