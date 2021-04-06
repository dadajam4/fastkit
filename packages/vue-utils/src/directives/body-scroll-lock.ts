import { DirectiveBinding, ObjectDirective } from 'vue';

import { disableBodyScroll, enableBodyScroll } from '@fastkit/body-scroll-lock';

export type BodyScrollLockDirectiveBinding = DirectiveBinding<
  boolean | undefined | void
>;

export const BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE =
  'data-vstack-scroll-lock-scroller';

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
    document.documentElement.setAttribute('data-vstack-body-scroll-lock', '');
    this.active = true;
  }

  private deactivate() {
    document.documentElement.removeAttribute('data-vstack-body-scroll-lock');
    this.active = false;
  }

  push(el: HTMLElement) {
    if (!this.els.includes(el)) {
      const lockElement =
        el.querySelector(`[${BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE}]`) || el;

      disableBodyScroll(lockElement);
      this.els.push(el);
      this.check();
    }
  }

  remove(el: HTMLElement) {
    const index = this.els.indexOf(el);
    if (index !== -1) {
      const lockElement =
        el.querySelector(`[${BODY_SCROLL_LOCK_SCROLL_ATTRIBUTE}]`) || el;

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

export const bodyScrollRockDirective: BodyScrollLockDirective = {
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
