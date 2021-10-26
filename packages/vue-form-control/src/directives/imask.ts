import { DirectiveBinding, ObjectDirective } from 'vue';
// import IMask, { AnyMaskedOptions } from 'imask';
import IMask from 'imask';
import {
  createIMaskEvent,
  IMaskEventType,
  IMaskInput,
  resolveIMaskInput,
} from '../schemes';
type AnyMaskedOptions = any;
export type IMaskDirectiveBindingValue = IMaskInput;

export type IMaskDirectiveBinding =
  DirectiveBinding<IMaskDirectiveBindingValue>;

export interface IMaskElement extends HTMLInputElement {
  maskRef?: IMask.InputMask<any>;
}

export type IMaskDirective = ObjectDirective<
  IMaskElement,
  IMaskDirectiveBindingValue
>;

function fireEvent(
  el: IMaskElement,
  type: IMaskEventType,
  inputMask?: IMask.InputMask<any>,
) {
  const ev = createIMaskEvent(type, {
    bubbles: true,
    cancelable: true,
    detail: inputMask,
  });

  el.dispatchEvent(ev);
}

function initMask(el: IMaskElement, opts: AnyMaskedOptions) {
  el.maskRef = IMask(el, opts)
    .on('accept', () => fireEvent(el, 'accept', el.maskRef))
    .on('complete', () => fireEvent(el, 'complete', el.maskRef));
}

function destroyMask(el: IMaskElement) {
  if (el.maskRef) {
    el.maskRef.destroy();
    delete el.maskRef;
  }
}

export const imaskDirective: IMaskDirective = {
  beforeMount(el, { value: options }) {
    options = resolveIMaskInput(options);
    options && initMask(el, options);
  },
  updated(el, { value: options }) {
    options = resolveIMaskInput(options);
    if (options) {
      if (el.maskRef) {
        el.maskRef.updateOptions(options);
        if (el.value !== el.maskRef.value) (el.maskRef as any)._onChange();
      } else initMask(el, options);
    } else {
      destroyMask(el);
    }
  },
  unmounted(el) {
    destroyMask(el);
  },
};

export function imaskDirectiveArgument(
  bindingValue?: IMaskDirectiveBindingValue,
): [IMaskDirective, IMaskDirectiveBindingValue] {
  return [imaskDirective, bindingValue];
}
