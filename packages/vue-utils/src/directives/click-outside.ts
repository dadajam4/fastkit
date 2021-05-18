import { DirectiveBinding, DirectiveHook, ObjectDirective, VNode } from 'vue';

export type ClickOutsideDirectiveHandler =
  | ((ev: MouseEvent | PointerEvent) => any)
  | undefined
  | void
  | false
  | null;

export interface ClickOutsideDirectiveBindingValue {
  handler?: ClickOutsideDirectiveHandler;
  conditional?: (ev: MouseEvent | PointerEvent, pre?: boolean) => boolean;
  include?: () => HTMLElement[];
}

export type RawClickOutsideDirectiveBindingValue =
  | ClickOutsideDirectiveHandler
  | ClickOutsideDirectiveBindingValue;

function normalizeRawClickOutsideDirectiveBindingValue(
  value: RawClickOutsideDirectiveBindingValue,
): ClickOutsideDirectiveBindingValue {
  if (value && typeof value === 'object') {
    return value;
  }
  return {
    handler: value,
  };
}

export type ClickOutsideDirectiveBinding =
  DirectiveBinding<RawClickOutsideDirectiveBindingValue>;

export const ClickOutsideDirectiveElementSymbol = Symbol(
  'ClickOutsideDirectiveElementSymbol',
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ClickOutsideDirectiveElement extends HTMLElement {
  [ClickOutsideDirectiveElementSymbol]?: (ev: MouseEvent | PointerEvent) => any;
}

export type ClickOutsideDirectiveVNode = VNode<
  any,
  ClickOutsideDirectiveElement
>;

export type ClickOutsideDirectiveHook = DirectiveHook<
  HTMLElement,
  VNode<any, HTMLElement> | null,
  ClickOutsideDirectiveBindingValue
>;

export type ClickOutsideDirective = ObjectDirective<
  ClickOutsideDirectiveElement,
  RawClickOutsideDirectiveBindingValue
>;

function pointerHook(
  ev: MouseEvent | PointerEvent,
  el: ClickOutsideDirectiveElement,
  binding: ClickOutsideDirectiveBinding,
) {
  const value = normalizeRawClickOutsideDirectiveBindingValue(binding.value);
  const { conditional, include, handler } = value;
  if (!handler || (conditional && !conditional(ev, true))) return;

  if (
    ('isTrusted' in ev && !ev.isTrusted) ||
    ('pointerType' in ev && !ev.pointerType)
  )
    return;

  const elements = (include && include()) || [];
  elements.push(el);

  !elements.some((el) => el.contains(ev.target as Node)) &&
    setTimeout(() => {
      if (conditional && !conditional(ev)) return;
      handler(ev);
    }, 0);
}

export const clickOutsideDirective: ClickOutsideDirective = {
  mounted(el, binding) {
    const onClick = (ev: MouseEvent | PointerEvent) =>
      pointerHook(ev, el, binding);
    document.addEventListener('click', onClick, true);
    el[ClickOutsideDirectiveElementSymbol] = onClick;
  },

  beforeUnmount(el) {
    const fn = el[ClickOutsideDirectiveElementSymbol];
    if (!fn) return;
    document.removeEventListener('click', fn, true);
    delete el[ClickOutsideDirectiveElementSymbol];
  },
  // getSSRProps(binding, vnode) {
  //   return undefined;
  // },
};

export function clickOutsideArgument(
  bindingValue: RawClickOutsideDirectiveBindingValue,
): [ClickOutsideDirective, RawClickOutsideDirectiveBindingValue] {
  return [clickOutsideDirective, bindingValue];
}
