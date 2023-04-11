import {
  ref,
  Ref,
  // readonly,
  watch,
  onMounted,
  onUnmounted,
  PropType,
  ExtractPropTypes,
  computed,
} from 'vue';
// import IMask, { AnyMaskedOptions } from 'imask';
import IMask from 'imask';
import {
  IMaskInput,
  resolveIMaskInput,
  IMaskEvent,
  createIMaskEvent,
} from '../schemes';
type AnyMaskedOptions = any;

export function createMaskControlProps() {
  return {
    mask: {} as PropType<IMaskInput>,
  };
}

export type IMaskControlProps = ExtractPropTypes<
  ReturnType<typeof createMaskControlProps>
>;

export function useIMaskControl(
  props: IMaskControlProps,
  opts: {
    // el: any;
    // onAccept?: any;
    // onComplete?: any;
    el: Ref<HTMLInputElement | null>;
    onAccept?: (ev: IMaskEvent) => void;
    onComplete?: (ev: IMaskEvent) => void;
  },
) {
  const { el, onAccept, onComplete } = opts;
  const maskInput = computed(() => resolveIMaskInput(props.mask));
  const inputMask = ref<IMask.InputMask<AnyMaskedOptions> | null>(null);
  const masked = ref<string>('');
  const unmasked = ref<string>('');
  const typed = ref<string | number | Date | undefined>();
  let $el: HTMLInputElement | undefined;
  let $masked: string | undefined;
  let $unmasked: string | undefined;
  // let $typed: string | number | Date | undefined;

  function _onAccept() {
    const _inputMask = inputMask.value;
    if (!_inputMask) return;

    const ev = createIMaskEvent('accept', { detail: _inputMask });
    // $typed = typed.value = _inputMask.typedValue;
    $unmasked = unmasked.value = _inputMask.unmaskedValue;
    $masked = masked.value = _inputMask.value;
    if (onAccept) onAccept(ev);
  }

  function _onComplete() {
    const _inputMask = inputMask.value;
    if (!_inputMask) return;
    const ev = createIMaskEvent('complete', { detail: _inputMask });
    if (onComplete) onComplete(ev);
  }

  function _initMask() {
    const _el = el.value;
    if (!_el) return;
    $el = _el;
    const $props = maskInput.value;

    if (!$el || !$props || !$props.mask) return;

    inputMask.value = IMask($el, $props)
      .on('accept', _onAccept)
      .on('complete', _onComplete);

    _onAccept();
  }

  function _destroyMask() {
    if (inputMask.value) {
      inputMask.value.destroy();
      inputMask.value = null;
    }
  }

  onMounted(_initMask);
  onUnmounted(_destroyMask);

  watch(unmasked, () => {
    if (inputMask.value && $unmasked !== unmasked.value) {
      $unmasked = inputMask.value.unmaskedValue = unmasked.value;
    }
  });

  watch(masked, () => {
    if (inputMask.value && $masked !== masked.value) {
      $masked = inputMask.value.value = masked.value;
    }
  });

  watch(typed, () => {
    if (inputMask.value) {
      // $typed = inputMask.value.typedValue = typed.value as any;
      inputMask.value.typedValue = typed.value as any;
    }
  });

  watch([el, maskInput], () => {
    const $newEl = el.value;
    const $props = maskInput.value;
    if (!$props || !$props.mask || $newEl !== $el) {
      _destroyMask();
      return;
    }
    if ($newEl) {
      if (!inputMask.value) {
        _initMask();
      } else {
        inputMask.value.updateOptions($props);
      }
    }
  });

  return {
    // ...The definition is too deep and the compiler dies
    inputMask: inputMask as any,
    masked,
    unmasked,
    typed,
  };
}
