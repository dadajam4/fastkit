import {
  ExtractPropTypes,
  PropType,
  SetupContext,
  computed,
  ComputedRef,
  onBeforeUnmount,
} from 'vue';
import {
  createPropsOptions,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  TypedSlot,
  cleanupEmptyVNodeChild,
} from '@fastkit/vue-utils';
import { FormNodeControl, FormNodeError } from './node';

const EMPTY_MESSAGE = '\xa0'; // for keep height

export function createFormControlProps() {
  return {
    ...createPropsOptions({
      nodeControl: {} as PropType<FormNodeControl>,
      label: {} as PropType<VNodeChildOrSlot>,
      hint: {} as PropType<VNodeChildOrSlot>,
      infoAppends: {} as PropType<VNodeChildOrSlot>,
      validating: Boolean,
      pending: Boolean,
      focused: Boolean,
      dirty: Boolean,
      pristine: Boolean,
      errors: {
        type: Array as PropType<FormNodeError[]>,
        default: () => [] as FormNodeError[],
      },
      disabled: Boolean,
      readonly: Boolean,
      touched: Boolean,
      untouched: Boolean,
      required: Boolean,
      invalid: Boolean,
      valid: Boolean,
      hiddenInfo: Boolean,
    }),
  };
}

export type FormControlProps = ExtractPropTypes<
  ReturnType<typeof createFormControlProps>
>;

export function createFormControlEmits() {
  return {
    clickLabel: (ev: MouseEvent, formControl: FormControl) => true,
  };
}

export type FormControlEmitOptions = ReturnType<typeof createFormControlEmits>;

export function createFormControlSettings() {
  const props = createFormControlProps();
  const emits = createFormControlEmits();
  return { props, emits };
}

export type FormControlContext = SetupContext<FormControlEmitOptions>;

export interface FormControlSlots {
  label: FormControl;
  hint: FormControl;
  infoAppends: FormControl;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormControlOptions {}

export class FormControl {
  protected _ctx: FormControlContext | undefined;
  protected _nodeControl: ComputedRef<FormNodeControl | undefined>;
  protected _labelSlot: ComputedRef<TypedSlot<FormControl> | undefined>;
  protected _hintSlot: ComputedRef<TypedSlot<FormControl> | undefined>;
  protected _infoAppendsSlot: ComputedRef<TypedSlot<FormControl> | undefined>;
  protected _validating: ComputedRef<boolean>;
  protected _pending: ComputedRef<boolean>;
  protected _focused: ComputedRef<boolean>;
  protected _dirty: ComputedRef<boolean>;
  protected _pristine: ComputedRef<boolean>;
  protected _errors: ComputedRef<FormNodeError[]>;
  protected _disabled: ComputedRef<boolean>;
  protected _readonly: ComputedRef<boolean>;
  protected _touched: ComputedRef<boolean>;
  protected _untouched: ComputedRef<boolean>;
  protected _required: ComputedRef<boolean>;
  protected _invalid: ComputedRef<boolean>;
  protected _valid: ComputedRef<boolean>;

  get nodeControl() {
    return this._nodeControl.value;
  }

  get validating() {
    return this._validating.value;
  }

  get pending() {
    return this._pending.value;
  }

  get focused() {
    return this._focused.value;
  }

  get dirty() {
    return this._dirty.value;
  }

  get pristine() {
    return this._pristine.value;
  }

  get errors() {
    return this._errors.value;
  }

  get firstError(): FormNodeError | undefined {
    return this.errors[0];
  }

  get disabled() {
    return this._disabled.value;
  }

  get readonly() {
    return this._readonly.value;
  }

  // get canOperation() {
  //   return !!this.nodeControl && this.nodeControl.canOperation;
  // }

  get touched() {
    return this._touched.value;
  }

  get untouched() {
    return this._untouched.value;
  }

  get required() {
    return this._required.value;
  }

  get invalid() {
    return this._invalid.value;
  }

  get valid() {
    return this._valid.value;
  }

  get labelSlot() {
    return this._labelSlot.value;
  }

  get hintSlot() {
    return this._hintSlot.value;
  }

  get infoAppendsSlot() {
    return this._infoAppendsSlot.value;
  }

  constructor(props: FormControlProps, ctx: FormControlContext) {
    const { slots } = ctx;

    this._ctx = ctx;

    this._nodeControl = computed(() => props.nodeControl);
    const nc = this._nodeControl;

    this._labelSlot = computed(() =>
      resolveVNodeChildOrSlots(props.label, slots.label),
    );

    this._hintSlot = computed(() =>
      resolveVNodeChildOrSlots(props.hint, slots.hint),
    );

    this._infoAppendsSlot = computed(() =>
      resolveVNodeChildOrSlots(props.infoAppends, slots.infoAppends),
    );

    const getPropOrNodeControlValue = <
      PK extends keyof typeof props,
      NK extends keyof FormNodeControl,
    >(
      propKey: PK,
      nodeControlKey: NK,
    ) => {
      return nc.value ? nc.value[nodeControlKey] : props[propKey];
    };

    this._validating = computed(() =>
      getPropOrNodeControlValue('validating', 'validating'),
    );
    this._pending = computed(() =>
      getPropOrNodeControlValue('pending', 'pending'),
    );
    this._focused = computed(() =>
      getPropOrNodeControlValue('focused', 'focused'),
    );
    this._dirty = computed(() => getPropOrNodeControlValue('dirty', 'dirty'));
    this._pristine = computed(() =>
      getPropOrNodeControlValue('pristine', 'pristine'),
    );
    this._errors = computed(() =>
      getPropOrNodeControlValue('errors', 'errors'),
    );
    this._disabled = computed(() =>
      getPropOrNodeControlValue('disabled', 'isDisabled'),
    );
    this._readonly = computed(() =>
      getPropOrNodeControlValue('readonly', 'isReadonly'),
    );
    this._touched = computed(() =>
      getPropOrNodeControlValue('touched', 'touched'),
    );
    this._untouched = computed(() =>
      getPropOrNodeControlValue('untouched', 'untouched'),
    );
    this._required = computed(
      () =>
        getPropOrNodeControlValue('required', 'isRequired') ||
        (!!nc.value && nc.value.hasRequired),
    );
    this._invalid = computed(() =>
      getPropOrNodeControlValue('invalid', 'invalid'),
    );
    this._valid = computed(() => getPropOrNodeControlValue('valid', 'valid'));

    onBeforeUnmount(() => {
      delete this._ctx;
    });
  }

  renderLabel() {
    const { labelSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  renderHint() {
    if (!this.focused) return;
    const { hintSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  renderInfoAppends() {
    const { infoAppendsSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  protected _getContextOrDir() {
    const { _ctx } = this;
    if (!_ctx) throw new Error('missing form control context');
    return _ctx;
  }

  renderFirstError() {
    if (this.disabled || this.readonly) {
      return;
    }
    const { firstError } = this;
    if (!firstError) return;
    const { slots } = this._getContextOrDir();
    const slot = slots[`error:${firstError.name}`] || slots.error;
    if (!slot) return firstError.message;
    const errorMessage = slot(firstError);
    if (!errorMessage.length) return;
    return errorMessage;
  }

  renderMessage() {
    if (this.disabled || this.readonly) return EMPTY_MESSAGE;
    const error = this.renderFirstError();
    if (error) return error;
    return this.renderHint() || EMPTY_MESSAGE;
  }

  expose() {
    return {
      labelSlot: this._labelSlot,
      hintSlot: this._hintSlot,
      infoAppendsSlot: this._infoAppendsSlot,
    };
  }
}

export function useFormControl(
  props: FormControlProps,
  ctx: FormControlContext,
) {
  const control = new FormControl(props, ctx);
  return control;
}
