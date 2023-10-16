import { defineComponent } from 'vue';
import { useActionable } from '../actionable';
import { actionableInheritProps, Actionable } from '../schemes';
import { defineSlots, defineTypedComponent } from '@fastkit/vue-utils';

// @TODO Unable to resolve dts for `navigationableInheritProps`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RouteLocationRaw } from 'vue-router';

export const ACTIONABLE_SLOTS = defineSlots<{
  default?: (actionable: Actionable) => any;
}>();

export const VActionI = defineComponent({
  name: 'VAction',
  inheritAttrs: false,
  props: {
    ...actionableInheritProps,
    ...ACTIONABLE_SLOTS(),
  },
  slots: ACTIONABLE_SLOTS,
  setup(_props, ctx) {
    const actionable = useActionable(ctx);
    ctx.expose(actionable);
    return () => actionable.render(ctx.slots.default?.(actionable));
  },
});

/**
 * Action Component
 *
 * @vue-tiny-meta
 *
 * @see {@link VActionI}
 */
export const VAction = defineTypedComponent(VActionI).$expose<Actionable>();
