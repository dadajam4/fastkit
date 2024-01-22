/* eslint-disable no-multi-assign */
import {
  ref,
  Ref,
  watch,
  onMounted,
  onUnmounted,
  PropType,
  ExtractPropTypes,
  computed,
  toRaw,
} from 'vue';
import type { InputMask, Masked, MaskedDynamicOptions } from 'imask';
import IMask, { MaskedDynamic, PIPE_TYPE } from 'imask';
import {
  IMaskInput,
  resolveIMaskInput,
  IMaskEvent,
  createIMaskEvent,
  MaskedDynamicOptionsWithMeta,
  AnyMaskedOptions,
} from '../schemes';

export type { AnyMaskedOptions } from '../schemes';

export type { InputMask as IMaskInstance } from 'imask';

export function createMaskedOptions<
  Opts extends
    | Omit<Exclude<AnyMaskedOptions, MaskedDynamicOptions>, 'dispatch'>
    | MaskedDynamicOptionsWithMeta,
>(options: Opts): Opts {
  return options;
}

export function createMaskControlProps() {
  return {
    /** Text Mask Settings */
    mask: {} as PropType<IMaskInput>,
  };
}

// export type IMaskInstance = InputMask;

export type IMaskControlProps = ExtractPropTypes<
  ReturnType<typeof createMaskControlProps>
>;

type IMaskPipeTypeMap = typeof PIPE_TYPE;
export type IMaskPipeType = IMaskPipeTypeMap[keyof IMaskPipeTypeMap];
type IMaskPipeValue = string | number | null | undefined;

export function useIMaskControl(
  props: IMaskControlProps,
  opts: {
    el: Ref<HTMLInputElement | null>;
    onAccept?: (ev: IMaskEvent) => void;
    onAcceptDynamicMeta?: (meta?: any) => void;
    onComplete?: (ev: IMaskEvent) => void;
  },
) {
  const { el, onAccept, onAcceptDynamicMeta, onComplete } = opts;
  const maskInput = computed(() => resolveIMaskInput(toRaw(props.mask)));
  const inputMask: Ref<InputMask | null> = ref(null);
  const staticMask: Ref<Masked | null> = ref(null);
  const masked = ref<string>('');
  const unmasked = ref<string>('');
  const typed = ref<string | number | Date | undefined>();
  let $el: HTMLInputElement | undefined;
  let $masked: string | undefined;
  let $unmasked: string | undefined;
  let $typed: string | number | Date | undefined;

  const pipe = (
    value: IMaskPipeValue,
    from: IMaskPipeType = PIPE_TYPE.MASKED,
  ): string => {
    const _value =
      // eslint-disable-next-line no-nested-ternary
      value == null ? '' : typeof value === 'number' ? String(value) : value;
    // eslint-disable-next-line no-shadow
    const masked = staticMask.value;
    if (!masked) return _value;
    return masked.runIsolated((m) => {
      m[from] = _value;
      return m[PIPE_TYPE.MASKED];
    });
  };

  function _onAccept() {
    const _inputMask = inputMask.value;
    if (!_inputMask) return;

    const ev = createIMaskEvent('accept', { detail: _inputMask });
    $typed = typed.value = _inputMask.typedValue;
    $unmasked = unmasked.value = _inputMask.unmaskedValue;
    $masked = masked.value = _inputMask.value;
    if (onAccept) onAccept(ev);
    if (onAcceptDynamicMeta) {
      // eslint-disable-next-line no-shadow
      const { masked } = _inputMask;
      if (masked instanceof MaskedDynamic) {
        if (masked.currentMask) {
          onAcceptDynamicMeta((masked.currentMask as any).meta);
        }
      }
    }
  }

  function _onComplete() {
    const _inputMask = inputMask.value;
    if (!_inputMask) return;
    const ev = createIMaskEvent('complete', { detail: _inputMask });
    if (onComplete) onComplete(ev);
  }

  function _initStaticMask() {
    const $props = maskInput.value;
    if (!$props || !$props.mask) return;
    staticMask.value = toRaw(IMask.createMask<any>($props));
  }

  _initStaticMask();

  function _initMask() {
    const _el = el.value;
    if (!_el) return;
    $el = _el;
    const $props = maskInput.value;

    if (!$el || !$props || !$props.mask) return;

    inputMask.value = toRaw(IMask($el, $props))
      .on('accept', _onAccept)
      .on('complete', _onComplete);
    _onAccept();
  }

  function _destroyMask() {
    if (inputMask.value) {
      inputMask.value.destroy();
      inputMask.value = null;
    }
    if (staticMask.value) {
      staticMask.value = null;
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
    if (
      inputMask.value &&
      $typed !== typed.value &&
      typed.value !== undefined
    ) {
      $typed = inputMask.value.typedValue = typed.value as any;
    }
  });

  watch([el, maskInput], () => {
    const $newEl = el.value;
    const $props = maskInput.value;
    if (!$props || !$props.mask || $newEl !== $el) {
      _destroyMask();
    }
    if (!$props || !$props.mask) {
      return;
    }

    _initStaticMask();

    if ($newEl) {
      if (!inputMask.value) {
        _initMask();
      } else {
        inputMask.value.updateOptions($props as any);
      }
    }
  });

  return {
    maskInput,
    inputMask,
    staticMask,
    masked,
    unmasked,
    typed,
    pipe,
  };
}

export type IMaskControl = ReturnType<typeof useIMaskControl>;
