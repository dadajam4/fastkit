import {
  Prop,
  PropType,
  ExtractPropTypes,
  SetupContext,
  WritableComputedRef,
  ComputedRef,
  computed,
  ref,
  Ref,
  watch,
  provide,
  inject,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  UnwrapRef,
  getCurrentInstance,
  ComponentInternalInstance,
  nextTick,
} from 'vue';

import {
  ValidatableRule,
  ValidationError,
  validate,
  required as requiredFactory,
} from '@fastkit/rules';
import { FormNodeInjectionKey, useParentForm } from '../injections';
import type { VueForm } from './form';
import { RecursiveArray, flattenRecursiveArray, toInt } from '@fastkit/helpers';
import { createPropsOptions } from '@fastkit/vue-utils';

export type RecursiveValidatableRule = RecursiveArray<ValidatableRule>;

export type FormNodeType = string | number | symbol;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormNodeError extends Omit<ValidationError, '$$symbol'> {}

export type FormNodeErrors = FormNodeError[];

export function toFormNodeError(
  source: string | ValidationError | FormNodeError,
): FormNodeError {
  if (typeof source === 'string') {
    return {
      name: source,
      message: source,
    };
  }
  return source;
}

export type ValidateTiming = 'always' | 'touch' | 'blur' | 'change' | 'manual';

export type ValidationResult = ValidationError[] | null;

type ValidateResolver = (result: ValidationResult) => void;

function cheepDeepEqual(a: any, b: any) {
  return toCompaireValue(a) === toCompaireValue(b);
}

function toCompaireValue(source: any): any {
  if (source && typeof source === 'object') {
    return JSON.stringify(source);
  }
  return source;
}

function cheepClone<T = any>(source: T): T {
  if (source && typeof source === 'object') {
    return JSON.parse(JSON.stringify(source));
  }
  return source;
}

export interface FormNodeControlBaseOptions {
  nodeType?: FormNodeType;
  defaultValidateTiming?: ValidateTiming;
  validationValue?: () => any;
}

export interface FormNodeControlOptions<T = any, D = T>
  extends FormNodeControlBaseOptions {
  modelValue?: Prop<T, D>;
}

export function createFormNodeProps<T, D = T>(
  options: FormNodeControlOptions<T, D> = {},
) {
  const { modelValue, defaultValidateTiming } = options;
  return {
    ...createPropsOptions({
      name: String,
      modelValue: modelValue || {},
      tabindex: {
        type: [String, Number],
        default: 0,
      },
      autofocus: Boolean,
      disabled: Boolean,
      readonly: Boolean,
      spellcheck: Boolean,
      viewonly: Boolean,
      required: Boolean,
      clearable: Boolean,
      validateTiming: {
        type: String as PropType<ValidateTiming>,
        default: defaultValidateTiming || 'touch',
      },
      rules: {
        type: Array as PropType<RecursiveValidatableRule>,
        default: () => [],
      },
      validationDeps: Function as PropType<
        (nodeControl: FormNodeControl) => any
      >,
      error: Boolean,
      errorMessages: [String, Array] as PropType<string | string[]>,
    }),
  };
}

export type FormNodeProps = ExtractPropTypes<
  ReturnType<typeof createFormNodeProps>
>;

export function createFormNodeEmits<T, D = T>(
  options: FormNodeControlOptions<T, D> = {},
) {
  return {
    'update:modelValue': (value: T | D) => true,
    'update:errors': (errors: FormNodeError[]) => true,
    change: (value: T | D) => true,
    focus: (ev: FocusEvent) => true,
    blur: (ev: FocusEvent) => true,
  };
}

class Wrapper<T, D = T> {
  // wrapped has no explicit return type so we can infer it
  wrapped(options: FormNodeControlOptions<T, D>) {
    return createFormNodeEmits<T, D>(options);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormNodeEmitOptions<T, D = T>
  extends ReturnType<Wrapper<T, D>['wrapped']> {}

export function createFormNodeSettings<T, D = T>(
  options: FormNodeControlOptions<T, D>,
) {
  const props = createFormNodeProps<T, D>(options);
  const emits = createFormNodeEmits<T, D>(options);
  return { options, props, emits };
}

export type FormNodeContext<T, D = T> = SetupContext<FormNodeEmitOptions<T, D>>;

export class FormNodeControl<T = any, D = T> {
  readonly nodeType?: FormNodeType;
  readonly autofocus: boolean;
  readonly __multiple: boolean;
  protected _ctx: FormNodeContext<T, D>;
  protected _parentNode: FormNodeControl | null;
  protected _parentForm: VueForm | null;
  protected _booted = ref(false);
  protected _value = ref<T | D>(null as unknown as T | D);
  protected _focused = ref(false);
  protected _initialValue = ref<T | D>(null as unknown as T | D);
  protected _children: FormNodeControl[] = [];
  protected _invalidChildren = ref<(() => FormNodeControl)[]>([]);
  protected _finshingPromise: Ref<(() => Promise<void>) | null> = ref(null);
  protected _validationErrors = ref<ValidationError[]>([]);
  protected _validateResolvers: ValidateResolver[] = [];
  protected _lastValidateValueChanged = true;
  protected _validating = ref(false);
  protected _validateRequestId = 0;
  protected _isDestroyed = false;
  protected _touched = ref(false);
  protected _shouldValidate = ref(false);
  protected _currentValue: WritableComputedRef<UnwrapRef<T> | UnwrapRef<D>>;
  protected _name: ComputedRef<string | undefined>;
  protected _errorMessages: ComputedRef<string[]>;
  protected _errors: ComputedRef<FormNodeError[]>;
  protected _firstError: ComputedRef<FormNodeError | undefined>;
  protected _hasMyError: ComputedRef<boolean>;
  protected _errorCount: ComputedRef<number>;
  protected _hasError: ComputedRef<boolean>;
  protected _isDisabled: ComputedRef<boolean>;
  protected _isReadonly: ComputedRef<boolean>;
  protected _canOperation: ComputedRef<boolean>;
  protected _validateTimingIsAlways: ComputedRef<boolean>;
  protected _validateTimingIsTouch: ComputedRef<boolean>;
  protected _validateTimingIsBlur: ComputedRef<boolean>;
  protected _validateTimingIsChange: ComputedRef<boolean>;
  protected _validateTimingIsManual: ComputedRef<boolean>;
  protected _spellcheck: ComputedRef<boolean>;
  protected _propRules: ComputedRef<RecursiveValidatableRule>;
  protected _required: ComputedRef<boolean>;
  protected _rules: ComputedRef<ValidatableRule[]>;
  protected _hasRequired: ComputedRef<boolean>;
  protected _hasInvalidChild: ComputedRef<boolean>;
  protected _tabindex: ComputedRef<number>;
  protected _submiting: ComputedRef<boolean>;
  protected _cii: ComponentInternalInstance | null = null;
  protected _validationValueGetter?: () => any;
  protected _validationSkip = false;

  get name() {
    return this._name.value;
  }

  get parentNode() {
    return this._parentNode;
  }

  get parentForm() {
    return this._parentForm;
  }

  get booted() {
    return this._booted.value;
  }

  get isFinishing() {
    return !!this._finshingPromise.value;
  }

  get validating() {
    return this._validating.value;
  }

  get pending() {
    return this.validating;
  }

  get value() {
    return this._currentValue.value;
  }

  set value(value) {
    this._currentValue.value = value;
  }

  get validationValue() {
    if (this._validationValueGetter) {
      return this._validationValueGetter();
    }
    return this.value;
  }

  get focused() {
    return this._focused.value;
  }

  get initialValue() {
    return this._initialValue.value;
  }

  get dirty() {
    return !cheepDeepEqual(this.value, this.initialValue);
  }

  get pristine() {
    return !this.dirty;
  }

  get children() {
    return this._children;
  }

  get invalidChildren(): FormNodeControl[] {
    return this._invalidChildren.value.map((g) => g());
  }

  get firstInvalidChild(): FormNodeControl | undefined {
    return this.invalidChildren[0];
  }

  get firstInvalidEl() {
    const { firstInvalidChild } = this;
    if (firstInvalidChild) {
      return firstInvalidChild.currentEl;
    }
    return null;
  }

  get validationErrors() {
    return this._validationErrors.value;
  }

  get errors() {
    return this._errors.value;
  }

  get firstError() {
    return this._firstError.value;
  }

  get hasMyError() {
    return this._hasMyError.value;
  }

  get errorCount() {
    return this._errorCount.value;
  }

  get hasError() {
    return this._hasError.value;
  }

  get isDisabled() {
    return this._isDisabled.value;
  }

  get isReadonly() {
    return this._isReadonly.value;
  }

  get canOperation() {
    return this._canOperation.value;
  }

  get validateTimingIsAlways() {
    return this._validateTimingIsAlways.value;
  }

  get validateTimingIsTouch() {
    return this._validateTimingIsTouch.value;
  }

  get validateTimingIsBlur() {
    return this._validateTimingIsBlur.value;
  }

  get validateTimingIsChange() {
    return this._validateTimingIsChange.value;
  }

  get validateTimingIsManual() {
    return this._validateTimingIsManual.value;
  }

  get touched() {
    return this._touched.value;
  }

  set touched(touched) {
    if (this._touched.value !== touched) {
      this._touched.value = touched;
      if (
        (touched && this.validateTimingIsTouch) ||
        this.validateTimingIsAlways
      ) {
        this.validateSelf();
      }
    }
  }

  get untouched() {
    return !this.touched;
  }

  get propRules() {
    return this._propRules.value;
  }

  get isRequired() {
    return this._required.value;
  }

  get rules() {
    return this._rules.value;
  }

  get hasRequired() {
    return this._hasRequired.value;
  }

  get isDestroyed() {
    return this._isDestroyed;
  }

  get hasInvalidChild() {
    return this._hasInvalidChild.value;
  }

  get invalid() {
    return this.hasMyError || this.hasInvalidChild;
  }

  get valid() {
    return !this.invalid;
  }

  get tabindex() {
    return this._tabindex.value;
  }

  get shouldValidate() {
    return this._shouldValidate.value;
  }

  get spellcheck() {
    return this._spellcheck.value;
  }

  get submiting() {
    return this._submiting.value;
  }

  get currentInstance() {
    return this._cii;
  }

  get currentEl() {
    const { currentInstance } = this;
    return currentInstance && (currentInstance.vnode.el as HTMLElement | null);
  }

  get multiple() {
    return this.__multiple;
  }

  constructor(
    props: FormNodeProps,
    ctx: FormNodeContext<T, D>,
    options: FormNodeControlOptions<T, D>,
  ) {
    this._ctx = ctx;

    const { nodeType } = options;

    this.__multiple = (props as any).multiple || false;
    this.nodeType = nodeType;
    this.autofocus = props.autofocus;
    this._validationValueGetter = options.validationValue;

    const parentNode = useParentFormNode();
    const parentForm = useParentForm();

    this._parentNode = parentNode;
    this._parentForm = parentForm;

    onMounted(() => {
      this._cii = getCurrentInstance();
    });

    provide(FormNodeInjectionKey, this);

    this._name = computed(() => props.name);

    this._currentValue = computed({
      get: () => this._value.value,
      set: (value) => {
        this.setValue(value as T | D);
      },
    });

    this._submiting = computed(() => {
      return (!!this._parentForm && this._parentForm.submiting) || false;
    });

    this._errorMessages = computed(() => {
      const { errorMessages = [] } = props;
      return Array.isArray(errorMessages) ? errorMessages : [errorMessages];
    });

    this._errors = computed(() => {
      return [
        ...this._errorMessages.value.map((value) => toFormNodeError(value)),
        ...this.validationErrors,
      ];
    });

    this._firstError = computed(() => {
      return this.errors[0];
    });

    this._errorCount = computed(() => {
      const baseCount = props.error ? 1 : 0;
      return this.errors.length + baseCount;
    });

    this._hasMyError = computed(() => {
      return this.errorCount > 0;
    });

    this._hasError = computed(() => {
      return this.hasMyError || (!!parentNode && parentNode.hasMyError);
    });

    this._isDisabled = computed(() => {
      return (
        props.disabled ||
        (!!parentNode && parentNode.isDisabled) ||
        this.submiting
      );
    });

    this._isReadonly = computed(() => {
      return props.readonly || (!!parentNode && parentNode.isReadonly);
    });

    this._canOperation = computed(() => {
      return !this.isDisabled && !this.isReadonly;
    });

    this._validateTimingIsAlways = computed(() => {
      return props.validateTiming === 'always';
    });

    this._validateTimingIsTouch = computed(() => {
      return props.validateTiming === 'touch';
    });

    this._validateTimingIsBlur = computed(() => {
      return props.validateTiming === 'blur';
    });

    this._validateTimingIsChange = computed(() => {
      return props.validateTiming === 'change';
    });

    this._validateTimingIsManual = computed(() => {
      return props.validateTiming === 'manual';
    });

    this._spellcheck = computed(() => props.spellcheck);
    this._propRules = computed(() => props.rules);
    this._required = computed(() => props.required);

    this._rules = computed(() => {
      return this._resolveRules();
    });

    this._hasRequired = computed(() => {
      return !!this.findRule('required');
    });

    this._hasInvalidChild = computed(() => {
      return this.invalidChildren.length > 0;
    });

    this._tabindex = computed(() => {
      return this.isDisabled ? -1 : toInt(props.tabindex);
    });

    (
      [
        '_syncValueFromProps',
        'focus',
        'blur',
        'validateSelf',
        'validate',
        // 'lock',
        // 'cancelLock',
      ] as const
    ).forEach((fn) => {
      const _fn = this[fn];
      this[fn] = _fn.bind(this) as any;
    });

    // const syncValueFromProps = (modelValue = props.modelValue) => {
    //   this._value.value = cheepClone(this.safeModelValue(modelValue)) as any;
    // };

    this.setShouldValidate(this.validateTimingIsAlways);

    watch(() => props.modelValue, this._syncValueFromProps, {
      immediate: true,
    });
    this._initialValue.value = cheepClone(props.modelValue) as any;

    watch(
      () => props.validateTiming,
      () => {
        if (
          this.validateTimingIsAlways ||
          (this.touched && this.validateTimingIsTouch) ||
          (this.dirty && this.validateTimingIsChange)
        ) {
          this.validateSelf();
        }
      },
      { immediate: true },
    );

    const onValidateValueChange = () => {
      this._lastValidateValueChanged = true;

      if (
        this.shouldValidate ||
        this.validateTimingIsChange ||
        this.validateTimingIsAlways
      ) {
        this.validateSelf();
      }
    };

    watch(
      () => this.value,
      (value) => {
        onValidateValueChange();
        this._ctx.emit('change', value as any);
      },
      { immediate: true },
    );

    watch(
      () => props.validationDeps && props.validationDeps(this),
      onValidateValueChange,
      // { deep: true },
    );

    watch(
      () => this.hasMyError,
      (hasMyError) => {
        parentNode && parentNode._updateInvalidNodesByNode(this);
      },
      { immediate: true },
    );

    watch(
      () => this.errors,
      (errors) => {
        ctx.emit('update:errors', errors);
      },
      { immediate: true },
    );

    if (parentNode) {
      parentNode._joinFromNode(this);
    }

    watch(
      () => this.rules,
      () => {
        if (this.shouldValidate) {
          this.validateSelf();
        }
      },
    );

    onBeforeMount(() => {
      this._booted.value = true;
    });

    onBeforeUnmount(() => {
      this.clearValidateResolvers();
      parentNode && parentNode._leaveFromNode(this);
      this._finshingPromise.value = null;
      this.resetSelfValidates();
      this._parentNode = null;
      this._parentForm = null;
      this._cii = null;
      this._isDestroyed = true;
      delete (this as any)._ctx;
    });

    (['focusHandler', 'blurHandler'] as const).forEach((fn) => {
      this[fn] = this[fn].bind(this);
    });
  }

  protected _finishing(): Promise<void> {
    return Promise.resolve();
  }

  finishing(): Promise<void> {
    const getter = this._finshingPromise.value;
    if (getter) return getter();
    const promise = this._finishing().finally(() => {
      this._finshingPromise.value = null;
    });
    this._finshingPromise.value = () => promise;
    return promise;
  }

  setValue(value: T | D) {
    if (!cheepDeepEqual(this._value.value, value)) {
      const v = cheepClone(value);
      this._value.value = v as any;
      this._ctx.emit('update:modelValue', v as any);
      return true;
    }
    return false;
  }

  protected _syncValueFromProps(value: any) {
    this._value.value = cheepClone(this.safeModelValue(value)) as any;
  }

  protected _resolveRules(): ValidatableRule[] {
    const { propRules, isRequired } = this;
    const rules = flattenRecursiveArray(propRules);

    if (isRequired) {
      rules.unshift(requiredFactory);
    }

    rules.sort((a, b) => {
      const { $name: an } = a;
      const { $name: bn } = b;
      if (an === 'required') return -1;
      if (bn === 'required') return 1;
      return 0;
    });
    return rules;
  }

  setShouldValidate(shouldValidate: boolean) {
    if (this.shouldValidate !== shouldValidate) {
      this._shouldValidate.value = shouldValidate;
    }
  }

  emptyValue(): T | D {
    return null as unknown as T | D;
  }

  safeModelValue(value: any): T | D {
    if (value == null) {
      return this.emptyValue();
    }
    return value;
  }

  findRule(ruleName: string) {
    return this.rules.find((r) => r.$name === ruleName);
  }

  resetSelfValue() {
    // this._value.value = cheepClone(this.initialValue);
    this.value = cheepClone(this.initialValue);
  }

  resetValue() {
    this.resetSelfValue();
    this.children.forEach((child) => child.resetValue());
  }

  commitSelfValue() {
    this._initialValue.value = cheepClone(this.value);
  }

  commitValue() {
    this.commitSelfValue();
    this.children.forEach((child) => child.commitValue());
  }

  resetSelfValidates() {
    this._validationErrors.value = [];
    this._lastValidateValueChanged = true;
    this.touched = false;
    this.setShouldValidate(!this.validateTimingIsAlways);
  }

  resetValidates() {
    this.resetSelfValidates();
    this.children.forEach((child) => child.resetValidates());
  }

  resetSelf() {
    this.resetSelfValue();
    this.resetSelfValidates();
  }

  skipValidation(fn: (...args: any) => any) {
    return new Promise<void>((resolve, reject) => {
      try {
        this._validationSkip = true;
        fn();
        nextTick(() => {
          nextTick(() => {
            this._validationSkip = false;
            resolve();
          });
        });
      } catch (_err) {
        this._validationSkip = false;
        reject(_err);
      }
    });
  }

  reset() {
    return this.skipValidation(() => this.resetValue()).then(() => {
      this.resetValidates();
    });
  }

  clearSelf() {
    this.value = this.emptyValue() as any;
  }

  clear() {
    this.clearSelf();
    this.children.forEach((child) => child.clear());
  }

  commitSelf() {
    this.commitSelfValue();
    this.resetSelfValidates();
  }

  commit() {
    this.commitValue();
    this.resetValidates();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  focus(opts?: FocusOptions): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  blur(): void {}

  async validate() {
    await Promise.all([this.validateSelf(), this.validateChildren()]);
    return this.valid;
  }

  validateChildren() {
    return Promise.all(this.children.map((node) => node.validate()));
  }

  validateSelf(force?: boolean): Promise<ValidationResult> {
    return new Promise(async (resolve) => {
      this.setShouldValidate(true);
      if (!force && !this._lastValidateValueChanged && !this.validating) {
        resolve(this.validationErrors);
        return;
      }

      this._validateResolvers.push(resolve);

      if (!force && !this._lastValidateValueChanged) {
        return;
      }

      this._validateRequestId++;
      const requestId = this._validateRequestId;
      this._validating.value = true;

      const { rules } = this;

      if (!this.focused) {
        await this.finishing();
      }

      const result = (await validate(this.validationValue, rules)) || [];

      // const result: VFormNodeErrors = [];
      // for (const fn of _rules) {
      //   if (requestId !== this.validateRequestId) {
      //     return;
      //   }
      //   try {
      //     let rowResult = fn(this.validationValue);
      //     if (isPromise<ValidationResult>(rowResult)) {
      //       rowResult = await rowResult;
      //     }
      //     if (this.isDestroyed) {
      //       break;
      //     }
      //     if (rowResult) {
      //       result.push(rowResult);
      //     }
      //   } catch (err) {
      //     const errName: string | void = err && err.name;
      //     result.push({
      //       [errName || 'exception']: err || 'exception',
      //     });
      //   }
      // }
      if (this.isDestroyed) {
        result.length = 0;
      }
      if (requestId !== this._validateRequestId) {
        return;
      }
      const { validationErrors } = this;
      validationErrors.splice(0, validationErrors.length, ...result);
      this._lastValidateValueChanged = false;
      this._validating.value = false;
      this.resolveValidateResolvers();
    });
  }

  private resolveValidateResolvers() {
    this._validateResolvers.forEach((resolver) =>
      resolver(this.validationErrors),
    );
    this.clearValidateResolvers();
  }

  private clearValidateResolvers() {
    this._validateResolvers = [];
  }

  /** @private */
  _joinFromNode(node: FormNodeControl) {
    const { _children } = this;
    if (!_children.includes(node)) {
      _children.push(node);
    }
  }

  /** @private */
  _leaveFromNode(node: FormNodeControl) {
    const { _children } = this;
    const index = _children.indexOf(node);
    if (index !== -1) {
      _children.splice(index, 1);
    }
    this.removeInvalidChild(node);
  }

  private pushInvalidChild(node: FormNodeControl) {
    const { invalidChildren } = this;
    if (!invalidChildren.includes(node)) {
      this._invalidChildren.value.push(() => node);
    }
  }

  private removeInvalidChild(node: FormNodeControl) {
    const { invalidChildren } = this;
    const index = invalidChildren.indexOf(node);
    if (index !== -1) {
      this._invalidChildren.value.splice(index, 1);
    }
  }

  /** @private */
  _updateInvalidNodesByNode(node: FormNodeControl) {
    if (node.hasMyError && !this.invalidChildren.includes(node)) {
      this.pushInvalidChild(node);
    } else {
      this.removeInvalidChild(node);
    }
  }

  focusHandler(ev: FocusEvent) {
    const before = this.focused;
    this._focused.value = true;
    this._touched.value = true;

    if (
      (!before && this.validateTimingIsTouch) ||
      this.validateTimingIsAlways
    ) {
      this.validateSelf();
    }
    this._ctx.emit('focus', ev);
  }

  blurHandler(ev: FocusEvent) {
    if (!this._ctx) return;
    const before = this.focused;
    this._focused.value = false;
    if ((before && this.validateTimingIsBlur) || this.validateTimingIsAlways) {
      this.validateSelf();
    }
    this._ctx.emit('blur', ev);
  }

  expose() {
    return {
      nodeControl: this as FormNodeControl,
      currentValue: this._currentValue,
      computedTabindex: this._tabindex,
      validating: this._validating,
      autofocus: this.autofocus,
      pending: computed(() => this.pending),
      focused: computed(() => this.focused),
      initialValue: this._initialValue,
      dirty: computed(() => this.dirty),
      pristine: computed(() => this.pristine),
      propRules: this._propRules,
      isRequired: this._required,
      errors: this._errors,
      firstError: this._firstError,
      hasMyError: this._hasMyError,
      hasError: this._hasError,
      isDisabled: this._isDisabled,
      isReadonly: this._isReadonly,
      canOperation: this._canOperation,
      touched: computed(() => this.touched),
      untouched: computed(() => this.untouched),
      isDestroyed: computed(() => this.isDestroyed),
      invalid: computed(() => this.invalid),
      valid: computed(() => this.valid),
      shouldValidate: computed(() => this._shouldValidate.value),
      spellcheck: this._spellcheck,
      submiting: this._submiting,
      focus: this.focus,
      blur: this.blur,
      validateSelf: this.validateSelf,
      validate: this.validate,
    };
  }
}

export function useParentFormNode() {
  return inject(FormNodeInjectionKey, null);
}

export function useFormNodeControl<T = any, D = T>(
  props: FormNodeProps,
  ctx: FormNodeContext<T, D>,
  opts: FormNodeControlOptions<T, D>,
) {
  const control = new FormNodeControl<T, D>(props, ctx, opts);
  return control;
}
