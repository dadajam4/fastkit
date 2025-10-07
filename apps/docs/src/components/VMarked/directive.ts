import { DirectiveHook, VNode, ObjectDirective } from 'vue';
import { Router } from 'vue-router';

export type MarkedDirective = ObjectDirective<
  MarkedElement,
  MarkedDirectiveBindingValue
>;

export interface MarkedDirectiveBindingValue {
  router: Router;
}

interface MarkedElement extends HTMLElement {
  __clearMarkedElementListener?: () => void;
}

export type MarkedDirectiveHook = DirectiveHook<
  MarkedElement,
  VNode<any, MarkedElement> | null,
  MarkedDirectiveBindingValue
>;

const hook: MarkedDirectiveHook = function hook(el, binding) {
  if (el.__clearMarkedElementListener) return;

  const listenerOptions = { capture: true };

  const listener = (ev: PointerEvent) => {
    if (ev.metaKey) return;
    const { target } = ev;
    if (!target) return;
    const routeLink = (target as HTMLElement).dataset.route;
    if (!routeLink) return;
    ev.preventDefault();
    binding.value.router.push(routeLink);
  };

  el.addEventListener('click', listener, listenerOptions);
  el.__clearMarkedElementListener = () => {
    el.removeEventListener('click', listener, listenerOptions);
    delete el.__clearMarkedElementListener;
  };
};

const beforeUnmount: MarkedDirectiveHook = function beforeUnmount(el) {
  el.__clearMarkedElementListener?.();
};

export const MarkedDirective: MarkedDirective = {
  mounted: hook,
  updated: hook,
  beforeUnmount,
};

export function MarkedDirectiveArgument(
  bindingValue: MarkedDirectiveBindingValue,
): [MarkedDirective, MarkedDirectiveBindingValue] {
  return [MarkedDirective, bindingValue];
}
