import {
  ExtractPropTypes,
  PropType,
  SetupContext,
  computed,
  ComputedRef,
  onBeforeUnmount,
  VNodeChild,
} from 'vue';
import {
  createPropsOptions,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  TypedSlot,
  cleanupEmptyVNodeChild,
  DefineSlotsType,
} from '@fastkit/vue-utils';
import {
  FormNodeControl,
  FormNodeError,
  toFormNodeError,
  FormNodeErrorSlots,
} from './node';
import type { VueFormService } from '../service';
import { useVueForm } from '../injections';

const EMPTY_MESSAGE = '\xa0'; // for keep height

export type RequiredChipSource = (() => VNodeChild) | string | boolean;

export type FormControlHinttip = boolean | string | (() => VNodeChild);

export type FormControlHinttipDelay = 'click' | number;

export type FormControlSlots = DefineSlotsType<
  {
    /** label */
    label?: (form: FormControl) => any;
    /** hint message */
    hint?: (form: FormControl) => any;
    /** Elements to be added to the information message */
    infoAppends?: (form: FormControl) => any;
  } & FormNodeErrorSlots
>;

export function createFormControlProps() {
  return {
    ...createPropsOptions({
      /**
       * Instance of FormNodeControl
       */
      nodeControl: {} as PropType<FormNodeControl>,
      /** label */
      label: {} as PropType<VNodeChildOrSlot>,
      /** hint message */
      hint: {} as PropType<VNodeChildOrSlot>,
      /** Settings for displaying hint as tips */
      hinttip: [Boolean, String, Function] as PropType<FormControlHinttip>,
      /** hint tip Display Delay */
      hinttipDelay: [String, Number] as PropType<FormControlHinttipDelay>,
      /** Elements to be added to the information message */
      infoAppends: {} as PropType<VNodeChildOrSlot>,
      /** Under validation */
      validating: Boolean,
      /** pending */
      pending: Boolean,
      /** In Focus */
      focused: Boolean,
      /** Already value changed */
      dirty: Boolean,
      /** Not yet value changed */
      pristine: Boolean,
      /** List of errors */
      errors: {
        type: Array as PropType<FormNodeError[]>,
        default: () => [] as FormNodeError[],
      },
      /** List of error messages. */
      errorMessages: [String, Array] as PropType<string | string[]>,
      /** disabled state */
      disabled: Boolean,
      /** read-only state */
      readonly: Boolean,
      /** view-only state */
      viewonly: Boolean,
      /** Already touched form */
      touched: Boolean,
      /** Not yet touching the form */
      untouched: Boolean,
      /** required */
      required: Boolean,
      /** There is an incorrect entry. */
      invalid: Boolean,
      /** Input is correct. */
      valid: Boolean,
      /** Hide information */
      hiddenInfo: Boolean,
      /** Chip(required) display settings */
      requiredChip: {} as PropType<RequiredChipSource>,
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

// FormNodeError

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormControlOptions {
  hinttipPrepend?: () => VNodeChild;
}

export class FormControl {
  readonly _service: VueFormService;
  protected _ctx: FormControlContext | undefined;
  protected _nodeControl: ComputedRef<FormNodeControl | undefined>;
  protected _labelSlot: ComputedRef<TypedSlot<FormControl> | undefined>;
  protected _hintSlot: ComputedRef<TypedSlot<FormControl> | undefined>;
  protected _hinttip: ComputedRef<VNodeChild>;
  protected _hinttipDelay: ComputedRef<FormControlHinttipDelay | undefined>;
  protected _hinttipPrepend?: () => VNodeChild;
  protected _infoAppendsSlot: ComputedRef<TypedSlot<FormControl> | undefined>;
  protected _validating: ComputedRef<boolean>;
  protected _pending: ComputedRef<boolean>;
  protected _focused: ComputedRef<boolean>;
  protected _dirty: ComputedRef<boolean>;
  protected _pristine: ComputedRef<boolean>;
  protected _errorMessages: ComputedRef<string[]>;
  protected _errors: ComputedRef<FormNodeError[]>;
  protected _disabled: ComputedRef<boolean>;
  protected _readonly: ComputedRef<boolean>;
  protected _viewonly: ComputedRef<boolean>;
  protected _touched: ComputedRef<boolean>;
  protected _untouched: ComputedRef<boolean>;
  protected _required: ComputedRef<boolean>;
  protected _invalid: ComputedRef<boolean>;
  protected _valid: ComputedRef<boolean>;

  get service() {
    return this._service;
  }

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

  get errorMessages() {
    return this._errorMessages.value;
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

  get viewonly() {
    return this._viewonly.value;
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

  get hinttipDelay() {
    return this._hinttipDelay.value;
  }

  constructor(
    props: FormControlProps,
    ctx: FormControlContext,
    options: FormControlOptions = {},
  ) {
    this._service = useVueForm();
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

    this._hinttipPrepend = options.hinttipPrepend;

    this._hinttip = computed(() => {
      const { hinttip } = props;
      if (!hinttip) return;
      if (typeof hinttip === 'function') return hinttip();
      const children: VNodeChild[] = [];
      if (this._hinttipPrepend) {
        children.push(this._hinttipPrepend());
      }
      if (typeof hinttip !== 'boolean') {
        children.push(hinttip);
      }
      return children;
    });

    this._hinttipDelay = computed(() => {
      const { hinttipDelay } = props;
      return hinttipDelay == null ? 500 : hinttipDelay;
    });

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
    this._errorMessages = computed(() => {
      const { errorMessages = [] } = props;
      return Array.isArray(errorMessages) ? errorMessages : [errorMessages];
    });
    this._errors = computed(() => {
      const { errorMessages } = this;
      const errors = [...errorMessages.map(toFormNodeError), ...props.errors];
      const ncErrors = nc.value?.errors;
      if (ncErrors) errors.push(...ncErrors);
      return errors;
    });
    this._disabled = computed(() =>
      getPropOrNodeControlValue('disabled', 'isDisabled'),
    );
    this._readonly = computed(() =>
      getPropOrNodeControlValue('readonly', 'isReadonly'),
    );
    this._viewonly = computed(() =>
      getPropOrNodeControlValue('viewonly', 'isViewonly'),
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
      delete (this as any)._service;
    });
  }

  renderLabel() {
    const { labelSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  renderHint(allowNotFocused?: boolean) {
    if (!allowNotFocused && !this.focused) return;
    const { hintSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  renderInfoAppends() {
    const { infoAppendsSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  protected _getContextOrDie() {
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
    const { slots } = this._getContextOrDie();
    const slot = slots[`error:${firstError.name}`] || slots.error;
    if (!slot) {
      return (
        this.service.resolveErrorMessage(firstError, this.nodeControl) ||
        firstError.message
      );
    }
    const errorMessage = slot(firstError);
    if (!errorMessage.length) return;
    return errorMessage;
  }

  renderMessage(allowNotFocused?: boolean) {
    if (this.disabled || this.readonly) return EMPTY_MESSAGE;
    const error = this.renderFirstError();
    if (error) return error;
    return (
      (!this._hinttip.value && this.renderHint(allowNotFocused)) ||
      EMPTY_MESSAGE
    );
  }

  renderHinttip():
    | {
        tip: VNodeChild;
        hint: VNodeChild;
      }
    | undefined {
    const { value: hinttip } = this._hinttip;
    if (!hinttip) {
      return;
    }
    const hint = this.renderHint(true);
    if (!hint) return;

    return {
      tip: hinttip,
      hint,
    };
  }

  expose() {
    return {
      labelSlot: this._labelSlot,
      hintSlot: this._hintSlot,
      hinttip: this._hinttip,
      hinttipDelay: this._hinttipDelay,
      infoAppendsSlot: this._infoAppendsSlot,
    };
  }
}

export function useFormControl(
  props: FormControlProps,
  ctx: FormControlContext,
  options?: FormControlOptions,
) {
  const control = new FormControl(props, ctx, options);
  return control;
}
