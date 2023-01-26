import { DirectiveBinding, ObjectDirective, App } from 'vue';
import { installDirective } from './utils';
import { disableBodyScroll, enableBodyScroll } from '@fastkit/body-scroll-lock';
import { pushDynamicStyle, IN_WINDOW } from '@fastkit/helpers';

export type BodyScrollLockDirectiveBindingValue = boolean | undefined | void;

export type BodyScrollLockDirectiveBinding =
  DirectiveBinding<BodyScrollLockDirectiveBindingValue>;

export const BODY_SCROLL_LOCK_ATTRIBUTE = 'data-body-scroll-lock';

export const BODY_SCROLL_LOCK_SCROLLER_ATTRIBUTE = 'data-scroll-lock-scroller';

if (IN_WINDOW) {
  pushDynamicStyle(`[${BODY_SCROLL_LOCK_ATTRIBUTE}] { overflow: hidden; }`);
}

class Stacks {
  readonly els: HTMLElement[] = [];
  active = false;

  private check() {
    const active = this.els.length > 0;
    if (active && !this.active) {
      this.activate();
    } else if (!active && this.active) {
      this.deactivate();
    }
  }

  private activate() {
    document.documentElement.setAttribute(BODY_SCROLL_LOCK_ATTRIBUTE, '');
    this.active = true;
  }

  private deactivate() {
    document.documentElement.removeAttribute(BODY_SCROLL_LOCK_ATTRIBUTE);
    this.active = false;
  }

  push(el: HTMLElement) {
    if (!this.els.includes(el)) {
      const lockElement =
        el.querySelector(`[${BODY_SCROLL_LOCK_SCROLLER_ATTRIBUTE}]`) || el;

      disableBodyScroll(lockElement);
      this.els.push(el);
      this.check();
    }
  }

  remove(el: HTMLElement) {
    const index = this.els.indexOf(el);
    if (index !== -1) {
      const lockElement =
        el.querySelector(`[${BODY_SCROLL_LOCK_SCROLLER_ATTRIBUTE}]`) || el;

      enableBodyScroll(lockElement);
      this.els.splice(index, 1);
      this.check();
    }
  }
}

const stacks = new Stacks();

export type BodyScrollLockDirective = ObjectDirective<
  HTMLElement,
  boolean | undefined | void
>;

export const bodyScrollLockDirective: BodyScrollLockDirective = {
  mounted(el, binding) {
    binding.value && stacks.push(el);
  },

  updated(el, binding) {
    if (binding.value) {
      stacks.push(el);
    } else {
      stacks.remove(el);
    }
  },

  unmounted(el) {
    stacks.remove(el);
  },
};

export function bodyScrollLockDirectiveArgument(
  bindingValue?: BodyScrollLockDirectiveBindingValue,
): [BodyScrollLockDirective, BodyScrollLockDirectiveBindingValue] {
  return [bodyScrollLockDirective, bindingValue];
}

export interface BodyScrollLockDirectiveAttrs {
  'v-body-scroll-lock'?: BodyScrollLockDirectiveBindingValue;
}

export function installBodyScrollLockDirective(app: App) {
  return installDirective(app, 'body-scroll-lock', bodyScrollLockDirective);
}
