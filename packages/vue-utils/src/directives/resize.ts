import { DirectiveHook, VNode, ObjectDirective, App } from 'vue';
import { debounce, Debounced } from '@fastkit/helpers';
import { installDirective } from './utils';

export type ResizeDirective = ObjectDirective<
  ResizableElement,
  RawResizeDirectiveBindingValue
>;

export interface ResizeDirectivePayload {
  width: number;
  height: number;
}

export type ResizeDirectiveHandler = (payload: ResizeDirectivePayload) => any;

export interface ResizeDirectiveBindingValue {
  handler: ResizeDirectiveHandler;
  debounce?: number;
  rootMode?: boolean;
}

export type RawResizeDirectiveBindingValue =
  | ResizeDirectiveHandler
  | ResizeDirectiveBindingValue;

export interface ResizeDirectiveContext {
  bindingValue: ResizeDirectiveBindingValue;
  handler: Debounced<ResizeDirectiveHandler>;
  resizeObserver?: ResizeObserver;
  rootResizeHandler?: () => void;
  destroy(): void;
}

interface ResizableElement extends HTMLElement {
  __resize_dir?: ResizeDirectiveContext;
}

const getDefaults = () => {
  return {
    debounce: 0,
  };
};

function resolveValue(
  value: ResizeDirectiveHandler | ResizeDirectiveBindingValue,
) {
  const defaults = getDefaults();
  if (typeof value === 'function') {
    return {
      ...defaults,
      handler: value,
    };
  }

  return {
    ...defaults,
    ...value,
  };
}

export type ResizeDirectiveHook = DirectiveHook<
  ResizableElement,
  VNode<any, ResizableElement> | null,
  RawResizeDirectiveBindingValue
>;

const hook: ResizeDirectiveHook = function hook(el, binding) {
  const { __resize_dir } = el;
  if (!binding.value) {
    __resize_dir && __resize_dir.destroy();
    return;
  }
  if (__resize_dir) {
    return;
  }

  const bindingValue = resolveValue(binding.value);
  const { handler: _handler, debounce: _debounce, rootMode } = bindingValue;
  const handler = debounce(_handler, _debounce);

  const ctx: ResizeDirectiveContext = {
    bindingValue,
    handler,
    destroy() {
      if (!el.__resize_dir) return;
      handler.clear();
      if (ctx.rootResizeHandler) {
        window.removeEventListener('resize', ctx.rootResizeHandler, false);
      }
      if (ctx.resizeObserver) {
        ctx.resizeObserver.unobserve(el);
        ctx.resizeObserver.disconnect();
        delete ctx.resizeObserver;
      }
      delete el.__resize_dir;
    },
  };

  if (rootMode) {
    ctx.rootResizeHandler = () => {
      handler({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', ctx.rootResizeHandler, false);
  } else {
    ctx.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        handler({ width, height });
      }
    });
    ctx.resizeObserver.observe(el);
  }

  el.__resize_dir = ctx;
};

const beforeUnmount: ResizeDirectiveHook = function beforeUnmount(el) {
  const { __resize_dir } = el;
  __resize_dir && __resize_dir.destroy();
};

export const resizeDirective: ResizeDirective = {
  mounted: hook,
  updated: hook,
  beforeUnmount,
};

export function resizeDirectiveArgument(
  bindingValue: RawResizeDirectiveBindingValue,
): [ResizeDirective, RawResizeDirectiveBindingValue] {
  return [resizeDirective, bindingValue];
}

export interface ResizeDirectiveAttrs {
  'v-resize'?: RawResizeDirectiveBindingValue;
}

export function installResizeDirective(app: App) {
  return installDirective(app, 'resize', resizeDirective);
}
