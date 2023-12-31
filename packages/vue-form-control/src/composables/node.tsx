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
  VNodeArrayChildren,
  nextTick,
  VNodeChild,
} from 'vue';

import {
  VerifiableRule,
  ValidationError,
  validate,
  required as requiredRule,
  type Rule,
} from '@fastkit/rules';
import {
  FormNodeInjectionKey,
  useParentForm,
  useParentFormGroup,
  useVueForm,
} from '../injections';
import type { VueForm } from './form';
import type { FormGroupControl } from './group';
import {
  RecursiveArray,
  flattenRecursiveArray,
  toInt,
  mixin,
} from '@fastkit/helpers';
import {
  createPropsOptions,
  DefineSlotsType,
  cleanupEmptyVNodeChild,
} from '@fastkit/vue-utils';
import type { VueFormService } from '../service';

export type RecursiveVerifiableRule = RecursiveArray<VerifiableRule>;

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

const HAS_REQUIRED_RULE_RE = /(^|:)required($|:)/;

function cheepDeepEqual(a: any, b: any) {
  return toCompareValue(a) === toCompareValue(b);
}

function toCompareValue(source: any): any {
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

export type FormNodeStateExtension = (
  nodeControl: FormNodeControl,
  computedValue: boolean,
) => boolean;

export interface FormNodeStateExtensions {
  disabled?: FormNodeStateExtension;
  readonly?: FormNodeStateExtension;
  viewonly?: FormNodeStateExtension;
  canOperation?: FormNodeStateExtension;
}

export interface FormNodeControlBaseOptions {
  nodeType?: FormNodeType;
  requiredFactory?: () => Rule<any> | undefined;
  defaultValidateTiming?: ValidateTiming;
  validationValue?: () => any;
  stateExtensions?: FormNodeStateExtensions;
}

export interface FormNodeControlOptions<
  T = any,
  D = T,
  Required extends Prop<any> = BooleanConstructor,
> extends FormNodeControlBaseOptions {
  modelValue?: Prop<T, D>;
  required?: Required;
}

export type FormNodeErrorSlotsSource = {
  /** Error message */
  error?: (error: FormNodeError) => any;
} & {
  /** Error messages per validation rule */
  [K in `error:${string}`]: (error: FormNodeError) => any;
};

export type FormNodeErrorSlots = DefineSlotsType<FormNodeErrorSlotsSource>;

export function createFormNodeProps<
  T,
  D = T,
  Required extends Prop<any> = PropType<boolean>,
>(options: FormNodeControlOptions<T, D, Required> = {}) {
  const { modelValue, defaultValidateTiming, required = Boolean } = options;
  return {
    ...createPropsOptions({
      /**
       * form node name
       *
       * This is set as is for input elements.
       */
      name: String,
      /**
       * Tag string for node searching
       */
      tag: String,
      /** model value */
      modelValue: modelValue || {},
      /**
       * Tab index
       *
       * @default 0
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/tabindex
       */
      tabindex: {
        type: [String, Number],
        default: 0,
      },
      /** Automatic focus */
      autofocus: Boolean,
      /** disabled state */
      disabled: Boolean,
      /** read-only state */
      readonly: Boolean,
      /** view-only state */
      viewonly: Boolean,
      /**
       * Spell Check Settings
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/spellcheck
       */
      spellcheck: Boolean,
      /** required */
      required,
      /** clearable */
      clearable: Boolean,
      /**
       * Validation Timing
       *
       * - `always` Always validate
       * - `touch` Once touched, always validated thereafter.
       * - `blur` Once the focus is removed from the element at least once, subsequent validations will always be performed.
       * - `change` Once the value is changed at least once, subsequent validations will always be performed.
       * - `manual` Validation is not performed automatically. Only manual validation through programming is possible.
       *
       * @see {@link ValidateTiming}
       */
      validateTiming: {
        type: String as PropType<ValidateTiming>,
        default: defaultValidateTiming || 'touch',
      },
      /**
       * List of validation rules
       */
      rules: {
        type: [Array, Object] as PropType<RecursiveVerifiableRule>,
        default: () => [],
      },
      /**
       * Validation dependencies
       *
       * In vue-form-control, validation is performed again whenever the input value or related values change. However, if the validation condition references values from other nodes or external reactive values that are not included in the node, those changes cannot be detected.
       * By registering a function that returns such external reactive values, validation can be automatically triggered.
       */
      validationDeps: Function as PropType<
        (nodeControl: FormNodeControl) => any
      >,
      /** Force an error state. */
      error: Boolean,
      /** List of error messages. */
      errorMessages: [String, Array] as PropType<string | string[]>,
      /**
       * Display error messages on this node itself
       *
       * If the node is within a group and the `collectErrorMessages` setting for that group is enabled, the display of error messages is delegated to the parent group.
       * If you want to exclude a specific node within the group from this association, enabling this setting allows the node to handle the display of error messages on its own.
       */
      showOwnErrors: {
        type: Boolean,
        default: undefined,
      },
      /**
       * Detach and become independent from the parent node
       *
       * By default, the form node inherits the state of the form node existing in the parent tree and notifies the parent node of its own validation status, among other things. This option disables that behavior, allowing this node and its descendants to be detached from the parent node.
       */
      detach: Boolean,
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
    /**
     * Update Model Values
     */
    'update:modelValue': (value: T | D) => true,
    /**
     * Updating error content.
     * @param errors - List of error contents.
     */
    'update:errors': (errors: FormNodeError[]) => true,
    /**
     * Update Model Values
     */
    change: (value: T | D) => true,
    /**
     * Focus on an element.
     * @param ev - FocusEvent
     */
    focus: (ev: FocusEvent) => true,
    /**
     * The focus is removed from an element.
     * @param ev - FocusEvent
     */
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

export interface RenderFormNodeErrorOptions {
  slotsOverrides?: FormNodeErrorSlotsSource;
  wrapper?: (
    children: VNodeArrayChildren,
    error: FormNodeError,
    node: FormNodeControl,
    index: number,
  ) => VNodeChild;
}
export class FormNodeControl<
  T = any,
  D = T,
  Required extends Prop<any> = BooleanConstructor,
> {
  readonly _props: FormNodeProps;
  readonly _service: VueFormService;
  readonly nodeType?: FormNodeType;
  readonly __multiple: boolean;
  protected _isMounted = ref(false);
  protected _ctx: FormNodeContext<T, D>;
  protected _parentNode: FormNodeControl | null;
  protected _parentForm: VueForm | null;
  protected _parentFormGroup: FormGroupControl | null;
  protected _booted = ref(false);
  protected _name: ComputedRef<string | undefined>;
  protected _value = ref<T | D>(null as unknown as T | D);
  protected _focused = ref(false);
  protected _initialValue = ref<T | D>(null as unknown as T | D);
  protected _children: FormNodeControl[] = [];
  protected _invalidChildren = ref<(() => FormNodeControl)[]>([]);
  protected _finalizePromise: Ref<(() => Promise<void>) | null> = ref(null);
  protected _validationErrors = ref<ValidationError[]>([]);
  protected _validateResolvers: ValidateResolver[] = [];
  protected _lastValidateValueChanged = true;
  protected _validating = ref(false);
  protected _validateRequestId = 0;
  protected _isDestroyed = false;
  protected _touched = ref(false);
  protected _shouldValidate = ref(false);
  protected _currentValue: WritableComputedRef<UnwrapRef<T> | UnwrapRef<D>>;
  protected _errorMessages: ComputedRef<string[]>;
  protected _errors: ComputedRef<FormNodeError[]>;
  protected _errorCount: ComputedRef<number>;
  protected _isDisabled: ComputedRef<boolean>;
  protected _isReadonly: ComputedRef<boolean>;
  protected _isViewonly: ComputedRef<boolean>;
  protected _canOperation: ComputedRef<boolean>;
  protected _rules: ComputedRef<VerifiableRule[]>;
  protected _hasRequired: ComputedRef<boolean>;
  protected _tabindex: ComputedRef<number>;
  protected _cii: ComponentInternalInstance | null = null;
  protected _validationValueGetter?: () => any;
  protected _validationSkip = false;
  protected _stateExtensions: FormNodeStateExtensions;
  protected _requiredFactory: () => Rule<any> | undefined;

  /**
   * Form Service
   *
   * @see {@link VueFormService}
   */
  get service() {
    return this._service;
  }

  /**
   * form node name
   *
   * This is set as is for input elements.
   */
  get name() {
    return this._name.value;
  }

  /**
   * Tag string for node searching
   */
  get tag() {
    return this._props.tag;
  }

  /** Parent node */
  get parentNode() {
    return this._parentNode;
  }

  /** Parent form group */
  get parentFormGroup() {
    return this._parentFormGroup;
  }

  /** Parent form */
  get parentForm() {
    return this._parentForm;
  }

  /** Automatic focus */
  get autofocus() {
    return this._props.autofocus;
  }

  /**
   * Detached and independent from the parent node
   */
  get detached() {
    return this._props.detach;
  }

  /**
   * Component created
   *
   * @remarks
   * Please be aware that it may not have been mounted yet.
   */
  get booted() {
    return this._booted.value;
  }

  /** Component mounted */
  get isMounted() {
    return this._isMounted.value;
  }

  /** Finalizing the value adjustment process */
  get isFinalizing() {
    return !!this._finalizePromise.value;
  }

  /** Validating the value */
  get validating() {
    return this._validating.value;
  }

  /**
   * Pending processing
   *
   * This is marked as `true` during the validation and finalization process of the value
   */
  get pending() {
    return this.validating || this.isFinalizing;
  }

  /** Current input value */
  get value() {
    return this._currentValue.value;
  }

  set value(value) {
    this._currentValue.value = value;
  }

  /** Value used for validation */
  get validationValue() {
    if (this._validationValueGetter) {
      return this._validationValueGetter();
    }
    return this.value;
  }

  /** In focus */
  get focused() {
    return this._focused.value;
  }

  /**
   * Initial value before commit
   *
   * This value, once initialized with the value passed when the FormNode is instantiated, will not be modified from within the vue-form-control package internals.
   * Calling the commit series of methods from the application side updates the value to its state at that moment.
   *
   * @see {@link FormNodeControl.commitSelfValue commitSelfValue}
   * @see {@link FormNodeControl.commitValue commitValue}
   * @see {@link FormNodeControl.commitSelf commitSelf}
   * @see {@link FormNodeControl.commit commit}
   */
  get initialValue() {
    return this._initialValue.value;
  }

  /**
   * The changes to the input value have not been committed yet
   *
   * @see {@link FormNodeControl.initialValue initialValue}
   */
  get dirty() {
    return !cheepDeepEqual(this.value, this.initialValue);
  }

  /**
   * The input value has not been changed from its initial value
   */
  get pristine() {
    return !this.dirty;
  }

  /**
   * Touched the elements of this node at least once
   */
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

  /**
   * Not touched the elements of this node yet.
   */
  get untouched() {
    return !this.touched;
  }

  /**
   * The list of FormNode instances directly belonging to this node as children
   */
  get children() {
    return this._children;
  }

  /**
   * The list of FormNode instances directly belonging to itself, and possessing one or more errors
   */
  get invalidChildren(): FormNodeControl[] {
    return this._invalidChildren.value.map((g) => g());
  }

  /**
   * The list of validation errors for the value within itself
   */
  get validationErrors() {
    return this._validationErrors.value;
  }

  /**
   * The list of all errors within itself
   *
   * This is a merged list of error messages injected through properties and its own `validationErrors`.
   *
   * @remarks
   * This list does not include error information specified with the `error` attribute.
   */
  get errors() {
    return this._errors.value;
  }

  /**
   * The first error within itself
   */
  get firstError() {
    return this.errors[0];
  }

  /**
   * Whether itself has one or more errors
   *
   * @remarks
   * This also takes into consideration the configuration of the `error` property.
   */
  get hasMyError() {
    return this.errorCount > 0;
  }

  /**
   * The number of errors it possesses
   */
  get errorCount() {
    return this._errorCount.value;
  }

  /**
   * Either itself or the parent node has one or more errors.
   */
  get hasError() {
    return this.hasMyError || (!this.detached && !!this.parentNode?.hasMyError);
  }

  /**
   * Either itself or the parent node is in a disabled state.
   */
  get isDisabled() {
    return this._isDisabled.value;
  }

  /**
   * Either itself or the parent node is in a read-only state.
   */
  get isReadonly() {
    return this._isReadonly.value;
  }

  /**
   * Either itself or the parent node is in a view-only state.
   */
  get isViewonly() {
    return this._isViewonly.value;
  }

  /**
   * Operable
   */
  get canOperation() {
    return this._canOperation.value;
  }

  get validateTiming() {
    return this._props.validateTiming;
  }

  /**
   * Always perform value validation.
   */
  get validateTimingIsAlways() {
    return this.validateTiming === 'always';
  }

  /**
   * Perform value validation only when the elements of this node have been touched at least once.
   */
  get validateTimingIsTouch() {
    return this.validateTiming === 'touch';
  }

  /**
   * Perform value validation when focus is removed from the elements of this node.
   */
  get validateTimingIsBlur() {
    return this.validateTiming === 'blur';
  }

  /**
   * Perform value validation when the input value changes.
   */
  get validateTimingIsChange() {
    return this.validateTiming === 'change';
  }

  /**
   * Value validation is manually performed on the application side.
   */
  get validateTimingIsManual() {
    return this.validateTiming === 'manual';
  }

  /**
   * The list of all rules, including those specified in the properties under 'rules' and others calculated from values related to rule logic.
   */
  get rules() {
    return this._rules.value;
  }

  /**
   * Input is required
   *
   * @remarks
   * This checks whether there is at least one 'required' rule in the 'required' setting or within the specified 'rules'.
   */
  get isRequired() {
    return this._hasRequired.value;
  }

  /**
   * The component has been destroyed
   */
  get isDestroyed() {
    return this._isDestroyed;
  }

  /**
   * There is at least one node in an error state among the nodes directly under this node
   */
  get hasInvalidChild() {
    return this.invalidChildren.length > 0;
  }

  /**
   * Either this node or one of its descendants has an error
   */
  get invalid() {
    return this.hasMyError || this.hasInvalidChild;
  }

  /**
   * This node and none of its descendants have an error
   */
  get valid() {
    return !this.invalid;
  }

  /**
   * Tab index
   *
   * When the node is disabled, it is forcibly set to `-1`.
   */
  get tabindex() {
    return this._tabindex.value;
  }

  /**
   * Spell Check Settings
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/spellcheck
   */
  get spellcheck() {
    return this._props.spellcheck;
  }

  /**
   * The input value should be validated
   *
   * This varies based on the specified `validateTiming` and the user's interaction status.
   */
  get shouldValidate() {
    return this._shouldValidate.value;
  }

  /**
   * The form to which this node belongs is currently executing an asynchronous submission action
   *
   * @remarks
   * If the `detach` option is set, this will always be `false`.
   */
  get sending() {
    return (
      (!this.detached && !!this._parentForm && this._parentForm.sending) ||
      false
    );
  }

  /**
   * The current Vue instance initializing this node
   */
  get currentInstance() {
    return this._cii;
  }

  /**
   * The host element of the current Vue instance initializing this node
   */
  get currentEl() {
    const { currentInstance } = this;
    return currentInstance && (currentInstance.vnode.el as HTMLElement | null);
  }

  /**
   * Multiple input mode
   */
  get multiple() {
    return this.__multiple;
  }

  /**
   * Display error messages on this node itself
   */
  get showOwnErrors() {
    return (
      this._props.showOwnErrors || !this.parentFormGroup?.collectErrorMessages
    );
  }

  constructor(
    props: FormNodeProps,
    ctx: FormNodeContext<T, D>,
    options: FormNodeControlOptions<T, D, Required>,
  ) {
    this._props = props;
    this._service = useVueForm();
    this._ctx = ctx;

    const { nodeType, stateExtensions } = options;

    this.__multiple = (props as any).multiple || false;
    this._name = computed(() => props.name);
    this.nodeType = nodeType;
    this._requiredFactory = options.requiredFactory || (() => requiredRule);
    this._validationValueGetter = options.validationValue;
    this._stateExtensions = stateExtensions || {};

    const parentNode = useParentFormNode();
    const parentFormGroup = useParentFormGroup();
    const parentForm = useParentForm();

    this._parentNode = parentNode;
    this._parentFormGroup = parentFormGroup;
    this._parentForm = parentForm;

    onMounted(() => {
      this._isMounted.value = true;
      this._cii = getCurrentInstance();
    });

    provide(FormNodeInjectionKey, this);

    this._currentValue = computed({
      get: () => this._value.value,
      set: (value) => {
        this.setValue(value as T | D);
      },
    });

    this._errorMessages = computed(() => {
      const { errorMessages = [] } = props;
      return Array.isArray(errorMessages) ? errorMessages : [errorMessages];
    });

    this._errors = computed(() => {
      return [
        ...this._errorMessages.value.map(toFormNodeError),
        ...this.validationErrors,
      ];
    });

    this._errorCount = computed(() => {
      const baseCount = props.error ? 1 : 0;
      return this.errors.length + baseCount;
    });

    this._isDisabled = computed(() => {
      const isDisabled =
        props.disabled ||
        (!this.detached && !!parentNode && parentNode.isDisabled) ||
        this.sending;

      const { disabled } = this._stateExtensions;
      return disabled ? disabled(this, isDisabled) : isDisabled;
    });

    this._isReadonly = computed(() => {
      const isReadonly =
        props.readonly ||
        (!this.detached && !!parentNode && parentNode.isReadonly);
      const { readonly: readonlyFn } = this._stateExtensions;
      return readonlyFn ? readonlyFn(this, isReadonly) : isReadonly;
    });

    this._isViewonly = computed(() => {
      const isViewonly =
        props.viewonly ||
        (!this.detached && !!parentNode && parentNode.isViewonly);
      const { viewonly: viewonlyFn } = this._stateExtensions;
      return viewonlyFn ? viewonlyFn(this, isViewonly) : isViewonly;
    });

    this._canOperation = computed(() => {
      const canOperation =
        !this.isDisabled && !this.isReadonly && !this.isViewonly;

      const { canOperation: canOperationFn } = this._stateExtensions;
      return canOperationFn ? canOperationFn(this, canOperation) : canOperation;
    });

    this._rules = computed(() => {
      return this._resolveRules();
    });

    this._hasRequired = computed(() => {
      return !!this._props.required || !!this.hasRequiredRule();
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
      ] as const
    ).forEach((fn) => {
      const _fn = this[fn];
      this[fn] = _fn.bind(this) as any;
    });

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
        (this.isMounted && this.validateTimingIsChange) ||
        this.validateTimingIsAlways
      ) {
        this.validateSelf();
      }
    };

    watch(() => this.validationValue, onValidateValueChange, {
      immediate: true,
    });

    watch(
      () => this.value,
      (value) => {
        // onValidateValueChange();
        this._ctx.emit('change', value as any);
      },
      { immediate: true },
    );

    watch(
      () =>
        props.validationDeps && props.validationDeps(this as FormNodeControl),
      onValidateValueChange,
      // { deep: true },
    );

    watch(
      () => this.hasMyError,
      (_hasMyError) => {
        if (!this.detached) {
          parentFormGroup && parentFormGroup.__updateInvalidNodesByNode(this);
          parentNode && parentNode._updateInvalidNodesByNode(this);
        }
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

    if (!this.detached) {
      parentFormGroup && parentFormGroup.__joinFromNode(this);
      parentNode && parentNode._joinFromNode(this);
    }

    watch(
      () => props.detach,
      (detached) => {
        if (detached) {
          parentFormGroup && parentFormGroup.__leaveFromNode(this);
          parentNode && parentNode._leaveFromNode(this);
        } else {
          parentFormGroup && parentFormGroup.__joinFromNode(this);
          parentNode && parentNode._joinFromNode(this);
        }
      },
    );

    watch(
      () => this.rules,
      () => {
        if (this.shouldValidate) {
          this.validateSelf(true);
        }
      },
    );

    onBeforeMount(() => {
      this._booted.value = true;
    });

    onBeforeUnmount(() => {
      this.clearValidateResolvers();
      parentNode && parentNode._leaveFromNode(this);
      parentFormGroup && parentFormGroup.__leaveFromNode(this);
      this._finalizePromise.value = null;
      this.resetSelfValidates();
      this._parentNode = null;
      this._parentFormGroup = null;
      this._parentForm = null;
      this._cii = null;
      this._isDestroyed = true;
      delete (this as any)._props;
      delete (this as any)._ctx;
      delete (this as any)._service;
      delete (this as any)._requiredFactory;
    });

    (['focusHandler', 'blurHandler'] as const).forEach((fn) => {
      this[fn] = this[fn].bind(this);
    });
  }

  protected hasRequiredRule() {
    return this.findRule(HAS_REQUIRED_RULE_RE);
  }

  /**
   * Recursively searches and retrieves the FormNode belonging to this node.
   *
   * @param predicate - Predicate executed recursively on descendant elements
   */
  findNodeRecursive(
    predicate: (node: FormNodeControl) => unknown,
  ): FormNodeControl | undefined {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const hit = child.findNodeRecursive(predicate);
      if (hit) return hit;
    }
  }

  /**
   * Recursively retrieves all FormNodes belonging to this node.
   *
   * @param predicate - Predicate executed recursively on descendant elements
   */
  filterNodesRecursive(
    predicate: (node: FormNodeControl) => unknown,
  ): FormNodeControl[] {
    const hits: FormNodeControl[] = [];
    for (const child of this.children) {
      if (predicate(child)) hits.push(child);
      hits.push(...child.filterNodesRecursive(predicate));
    }
    return hits;
  }

  /**
   * Search for a node within this node that matches the specified name
   *
   * @param name Node name
   */
  findNodeByName(name: string) {
    return this.findNodeRecursive((node) => node.name === name);
  }

  /**
   * Search for a node within this node that matches the specified tag
   *
   * @param tag Tag string
   */
  findNodeByTag(tag: string) {
    return this.findNodeRecursive((node) => node.tag === tag);
  }

  protected _getContextOrDie() {
    const { _ctx } = this;
    if (!_ctx) throw new Error('missing form node context');
    return _ctx;
  }

  /**
   * Render the specified error source as a `VNodeArrayChildren`
   *
   * @param errorSource - string or FormNodeError
   */
  renderErrorSource(
    errorSource: string | FormNodeError,
    slotsOverrides?: FormNodeErrorSlotsSource,
  ): VNodeArrayChildren | undefined {
    const { slots } = this._getContextOrDie();
    const error =
      typeof errorSource === 'string'
        ? toFormNodeError(errorSource)
        : errorSource;
    if (slotsOverrides) {
      const slot =
        slotsOverrides[`error:${error.name}`] || slotsOverrides.error;
      const message = cleanupEmptyVNodeChild(slot?.(error));
      if (message) return message;
    }
    const slot = slots[`error:${error.name}`] || slots.error;
    if (slot) {
      const message = cleanupEmptyVNodeChild(slot?.(error));
      if (message) return message;
    }
    return cleanupEmptyVNodeChild(
      this.service.resolveErrorMessage(error, this) || error.message,
    );
  }

  /** @internal */
  _renderFirstError(
    slotsOverrides?: FormNodeErrorSlotsSource,
  ): VNodeArrayChildren | undefined {
    if (!this.canOperation) {
      return;
    }
    const { firstError } = this;
    if (!firstError) return;
    return this.renderErrorSource(firstError, slotsOverrides);
  }

  /**
   * Render the first error of this node itself as a `VNodeArrayChildren`
   *
   * @remarks
   * Please note that nothing will be returned if the node is inoperable.
   * Also, if the parent group is configured to collect errors for this node and `showOwnErrors` for this node is disabled, this method will return nothing.
   *
   * @see {@link FormNodeControl.canOperation canOperation}
   * @see {@link FormNodeControl.showOwnErrors showOwnErrors}
   */
  renderFirstError(
    slotsOverrides?: FormNodeErrorSlotsSource,
  ): VNodeArrayChildren | undefined {
    if (this.showOwnErrors) {
      return this._renderFirstError(slotsOverrides);
    }
  }

  /**
   * @internal
   */
  _renderAllErrors(options?: RenderFormNodeErrorOptions): VNodeArrayChildren[] {
    if (!this.canOperation) {
      return [];
    }
    const results: VNodeArrayChildren[] = [];
    const wrapper = options?.wrapper;
    this.errors.map((error, index) => {
      const result = this.renderErrorSource(error, options?.slotsOverrides);
      if (result) {
        const wrapped = wrapper
          ? cleanupEmptyVNodeChild(wrapper(result, error, this, index))
          : result;
        wrapped && results.push(wrapped);
      }
    });
    return results;
  }

  /**
   * Render all errors held by this node as an array of `VNodeArrayChildren`
   *
   * @remarks
   * Please note that nothing will be returned if the node is inoperable.
   * Also, if the parent group is configured to collect errors for this node and `showOwnErrors` for this node is disabled, this method will return nothing.
   *
   * @see {@link FormNodeControl.canOperation canOperation}
   * @see {@link FormNodeControl.showOwnErrors showOwnErrors}
   */
  renderAllErrors(options?: RenderFormNodeErrorOptions): VNodeArrayChildren[] {
    return this.showOwnErrors ? this._renderAllErrors(options) : [];
  }

  protected _finalize(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Finalize the input value
   */
  finalize(): Promise<void> {
    const getter = this._finalizePromise.value;
    if (getter) return getter();
    const promise = this._finalize().finally(() => {
      this._finalizePromise.value = null;
    });
    this._finalizePromise.value = () => promise;
    return promise;
  }

  /**
   * Set the value
   *
   * @param value - value
   */
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

  protected _resolveRules(): VerifiableRule[] {
    const { rules: propRules, required } = this._props;
    const rules = flattenRecursiveArray(propRules);

    if (required) {
      const requiredRule = this._requiredFactory();
      requiredRule && rules.unshift(requiredRule);
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

  /**
   * Set the validation execution necessity
   *
   * @param shouldValidate - The input value should be validated
   */
  setShouldValidate(shouldValidate: boolean) {
    if (this.shouldValidate !== shouldValidate) {
      this._shouldValidate.value = shouldValidate;
    }
  }

  /**
   * Retrieve the default value when there is no input value
   */
  emptyValue(): T | D {
    return null as unknown as T | D;
  }

  safeModelValue(value: any): T | D {
    if (value == null) {
      return this.emptyValue();
    }
    return value;
  }

  findRule(ruleName: string | RegExp) {
    return this.rules.find((r) => {
      const { $name } = r;
      return typeof ruleName === 'string'
        ? ruleName === $name
        : ruleName.test($name);
    });
  }

  /**
   * Reset the input value of this node to the initial value or the value at the last commit, whichever is applicable
   *
   * @see {@link FormNodeControl.initialValue initialValue}
   *
   * @remarks
   * This method does not reset the validation state. Typically, consider using {@link FormNodeControl.resetSelf resetSelf}.
   */
  resetSelfValue() {
    this.value = cheepClone(this.initialValue);
  }

  /**
   * Reset the input value of this node and all its descendant nodes to the initial value or the value at the last commit, whichever is applicable
   *
   * @see {@link FormNodeControl.resetSelfValue resetSelfValue}
   *
   * @remarks
   * This method does not reset the validation state. Typically, consider using {@link FormNodeControl.resetSelf reset}.
   */
  resetValue() {
    this.resetSelfValue();
    this.children.forEach((child) => child.resetValue());
  }

  /**
   * Set the current input value as the initial value for this node.
   *
   * @remarks
   * This method does not reset the validation state. Typically, consider using {@link FormNodeControl.commitSelf commitSelf}.
   */
  commitSelfValue() {
    this._initialValue.value = cheepClone(this.value);
  }

  /**
   * Set the current input value as the initial value for this node and all its descendant nodes
   *
   * @remarks
   * This method does not reset the validation state. Typically, consider using {@link FormNodeControl.commit commit}.
   */
  commitValue() {
    this.commitSelfValue();
    this.children.forEach((child) => child.commitValue());
  }

  /**
   * Reset the validation state of this node
   *
   * @remarks
   * This method does not perform a reset on descendant nodes. Typically, consider using {@link FormNodeControl.resetValidates resetValidates}.
   */
  resetSelfValidates() {
    this._validationErrors.value = [];
    this._lastValidateValueChanged = true;
    this.touched = false;
    this.setShouldValidate(!this.validateTimingIsAlways);
  }

  /**
   * Reset the validation state of this node and all its descendant nodes
   */
  resetValidates() {
    this.resetSelfValidates();
    this.children.forEach((child) => child.resetValidates());
  }

  /**
   * Reset the input value of this node to the initial value and reset the validation state
   *
   * @remarks
   * This method does not reset the state of descendant nodes. Typically, consider using {@link FormNodeControl.reset reset}.
   */
  resetSelf() {
    this.resetSelfValue();
    this.resetSelfValidates();
  }

  /**
   * Execute any process while skipping ongoing asynchronous validation, if any
   *
   * @param fn - The function to be executed
   */
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

  /**
   * Reset the input value of this node and all its descendant nodes to the initial value and reset the validation state
   */
  reset() {
    return this.skipValidation(() => this.resetValue()).then(() => {
      this.resetValidates();
    });
  }

  /**
   * Clear the input value of this node
   */
  clearSelf() {
    this.value = this.emptyValue() as any;
  }

  /**
   * Clear the input value of this node and all its descendant nodes
   */
  clear() {
    this.clearSelf();
    this.children.forEach((child) => child.clear());
  }

  /**
   * Set the current input value of this node as the initial value and reset the validation state
   *
   * @remarks
   * This method does not reset the state of descendant nodes. Typically, consider using {@link FormNodeControl.commit commit}.
   */
  commitSelf() {
    this.commitSelfValue();
    this.resetSelfValidates();
  }

  /**
   * Set the current input value as the initial value for this node and all its descendant nodes, and reset the validation state
   */
  commit() {
    this.commitValue();
    this.resetValidates();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  focus(opts?: FocusOptions): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  blur(): void {}

  /**
   * Execute validation for this node and all its descendant nodes, and retrieve the validation results
   *
   * @returns If validation is successful, return `true`.
   */
  async validate() {
    await Promise.all([this.validateSelf(), this.validateChildren()]);
    return this.valid;
  }

  /**
   * Validate all nodes belonging to this node
   *
   * @remarks
   * Typically, consider using {@link FormNodeControl.validate validate}.
   */
  validateChildren() {
    return Promise.all(this.children.map((node) => node.validate()));
  }

  /**
   * Validate the input value of this node
   *
   * This method usually cancels execution and returns the previous result in the following conditions:
   *
   * - The value for validation has not changed since the last validation.
   * - Currently, asynchronous validation is in progress.
   *
   * If you want to ignore this and force validation, specify `true` for the `force` argument
   *
   * @param force - Force execution
   *
   * @returns Validation result (either the list of validation errors or null).
   *
   * @remarks
   * This method does not perform a reset on descendant nodes. Typically, consider using {@link FormNodeControl.validate validate}.
   */
  validateSelf(force?: boolean): Promise<ValidationResult> {
    // eslint-disable-next-line no-async-promise-executor
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
        await this.finalize();
      }

      const result = (await validate(this.validationValue, rules)) || [];

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

  /** @internal */
  _joinFromNode(node: FormNodeControl) {
    const { _children } = this;
    if (!_children.includes(node)) {
      _children.push(node);
    }
  }

  /** @internal */
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

  /** @internal */
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

  /**
   * Scroll to the visible position of the host element of this node
   *
   * @param options - options
   */
  scrollIntoView(options?: ScrollIntoViewOptions) {
    const { currentEl } = this;
    currentEl && this.service.scrollToElement(currentEl, options);
  }

  /**
   * Generate a Proxy instance that extends the interface for this node.
   *
   * @param trait - trait object
   * @returns Mixed-in Proxy
   */
  extend<U extends object>(trait: U) {
    return mixin(this, trait);
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
