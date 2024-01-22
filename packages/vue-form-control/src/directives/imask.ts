import { DirectiveBinding, ObjectDirective } from 'vue';
import IMask, { InputMask } from 'imask';
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
  maskRef?: InputMask<any>;
}

export type IMaskDirective = ObjectDirective<
  IMaskElement,
  IMaskDirectiveBindingValue
>;

function fireEvent(
  el: IMaskElement,
  type: IMaskEventType,
  inputMask?: InputMask<any>,
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
    const _options = resolveIMaskInput(options);
    _options && initMask(el, _options);
  },
  updated(el, { value: options }) {
    const _options = resolveIMaskInput(options);
    if (_options) {
      if (el.maskRef) {
        el.maskRef.updateOptions(_options as any);
        if (el.value !== el.maskRef.value) (el.maskRef as any)._onChange();
      } else initMask(el, _options);
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
