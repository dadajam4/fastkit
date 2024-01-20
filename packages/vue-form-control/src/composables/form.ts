import {
  ExtractPropTypes,
  SetupContext,
  provide,
  PropType,
  ComputedRef,
  computed,
  ref,
  Ref,
  onBeforeUnmount,
  watch,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { isPromise } from '@fastkit/helpers';
import {
  createFormGroupProps,
  createFormGroupEmits,
  FormGroupOptions,
  FormGroupControl,
} from './group';
import { FormInjectionKey } from '../injections';

/**
 * Form action context
 */
export interface FormActionContext {
  /** Control for form element */
  form: VueForm;
  /** Action has been canceled */
  get canceled(): boolean;
  /** Submit event object */
  get event(): Event;
  /**
   * Cancel the action
   *
   * Currently, this method simply sets the `canceled` property of the context to `false`.
   * This specification is subject to change in the future.
   */
  cancel: () => void;
}

export type FormActionHandler = (ctx: FormActionContext) => any;

/**
 * @deprecated
 * This type has been changed to {@link FormActionHandler}. It will be deprecated in future releases.
 */
export type FormFunctionableAction = FormActionHandler;

export type FormAction = string | FormActionHandler;

export interface FormInvalidSubmissionAcceptorContext {
  /** Form control */
  readonly form: VueForm;
  /**
   * Accepted
   */
  get accepted(): boolean;
  /**
   * Accept submission
   */
  accept(): void;
}

export type FormInvalidSubmissionAcceptor = (
  payload: FormInvalidSubmissionAcceptorContext,
) => void;

export type FormAcceptInvalidSubmissionSpec =
  | boolean
  | FormInvalidSubmissionAcceptor;

export interface FormOptions extends FormGroupOptions {}

export function createFormProps(options: FormOptions = {}) {
  return {
    ...createFormGroupProps(),
    ...createPropsOptions({
      /**
       * Do not perform default HTML validation when submitting the form
       *
       * @default true
       */
      novalidate: {
        type: Boolean,
        default: true,
      },
      /**
       * Action settings for form submission
       *
       * Set the destination URL or callback handler
       */
      action: [String, Function] as PropType<FormAction>,
      /**
       * Automatic validation on transmission
       *
       * If this setting is enabled, all validation will be done before transmission and the transmission process will be canceled if there are invalid entries
       *
       * @default true
       */
      autoValidate: {
        type: Boolean,
        default: true,
      },
      /**
       * Form is sending
       */
      sending: Boolean,
      /**
       * Accept invalid values during form submission
       *
       * @default false
       */
      acceptInvalidSubmission: {
        type: [Boolean, Function] as PropType<FormAcceptInvalidSubmissionSpec>,
        default: false,
      },
    }),
  };
}

export type FormProps = ExtractPropTypes<ReturnType<typeof createFormProps>>;

export function createFormEmits() {
  return {
    ...createFormGroupEmits(),
    /**
     * Form Submission
     *
     * This event is notified when the validation is complete and before the action is called
     *
     * @param form - VueForm instance
     * @param ev - Event
     */
    submit: (form: VueForm, ev: Event) => true,
    /**
     * Updating sending status
     *
     * @param sending - sending status
     * @param form - VueForm instance
     */
    'update:sending': (sending: boolean, form: VueForm) => true,
    /**
     * The form action has been finished
     *
     * @param actionContext - Form action context
     */
    finishAction: (actionContext: FormActionContext) => true,
    /**
     * Failed automatic validation
     *
     * @param form - VueForm instance
     */
    autoValidationFailed: (form: VueForm) => true,
  };
}

export type FormEmits = ReturnType<typeof createFormEmits>;

export function createFormSettings(options?: FormOptions) {
  const props = createFormProps(options);
  const emits = createFormEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormEmitOptions extends ReturnType<typeof createFormEmits> {}

export type FormContext = SetupContext<FormEmitOptions>;

/**
 * Option to check the submittability of the form
 */
export interface PrepareFormSubmissionOptions {
  /** Skip operability check */
  skipOperationCheck?: boolean;
  /** Skip in-progress check during submission */
  skipSendingCheck?: boolean;
  /** Skip validation */
  skipValidation?: boolean;
}

/**
 * Dispatch option for form action
 */
export interface DispatchFormActionOptions
  extends PrepareFormSubmissionOptions {
  /** Submit event object */
  event?: Event;
}

interface ComputedFormAttributes {
  ref: Ref<HTMLFormElement | null>;
  action: string | undefined;
  spellcheck: boolean;
  onSubmit: (ev: Event) => void;
  novalidate: boolean;
  'aria-disabled': boolean;
}

/**
 * Control for form element
 */
export class VueForm extends FormGroupControl {
  readonly _props: FormProps;

  protected _formContext: FormContext;

  protected _nativeAction: ComputedRef<string | undefined>;

  protected _fnAction: ComputedRef<FormActionHandler | undefined>;

  protected _formRef = ref<HTMLFormElement | null>(null);

  protected _actionPromise = ref<Promise<any> | null>(null);

  protected _sending: ComputedRef<boolean>;

  protected _formAttrs: ComputedRef<ComputedFormAttributes>;

  /**
   * Do not perform default HTML validation when submitting the form
   */
  get novalidate() {
    return this._props.novalidate;
  }

  get nativeAction() {
    return this._nativeAction.value;
  }

  /**
   * Executing asynchronous submission action
   */
  get sending() {
    return this._sending.value;
  }

  /**
   * Automatic validation on transmission
   *
   * If this setting is enabled, all validation will be done before transmission and the transmission process will be canceled if there are invalid entries
   *
   * @default true
   */
  get autoValidate() {
    return this._props.autoValidate;
  }

  /**
   * Attributes to apply to the form element
   */
  get formAttrs() {
    return this._formAttrs.value;
  }

  constructor(props: FormProps, ctx: FormContext, options: FormOptions = {}) {
    super(props, ctx, {
      ...options,
    });
    this._props = props;
    this._formContext = ctx;
    this._nativeAction = computed(() => {
      if (typeof props.action === 'string') return props.action;
      return undefined;
    });
    this._fnAction = computed(() => {
      if (typeof props.action === 'function') return props.action;
      return undefined;
    });
    this._sending = computed(
      () => props.sending || this._actionPromise.value !== null,
    );
    this._formAttrs = computed(() => ({
      ref: this._formRef,
      action: this.nativeAction,
      spellcheck: this.spellcheck,
      onSubmit: this.handleSubmit,
      novalidate: this._props.novalidate,
      'aria-disabled': this.isDisabled,
    }));

    onBeforeUnmount(() => {
      this._actionPromise.value = null;
      delete (this as any)._formContext;
    });

    (['submit', 'handleSubmit'] as const).forEach((fn) => {
      const _fn = this[fn];
      this[fn] = _fn.bind(this) as any;
    });

    watch(
      () => this._sending.value,
      (sending) => {
        ctx.emit('update:sending', sending, this);
      },
    );

    provide(FormInjectionKey, this);
  }

  /**
   * Generates SubmitEvent and dispatches it to the form element
   *
   * - If `preventDefault()` is called by the event handler, the sending process is canceled
   */
  submit() {
    const form = this._formRef.value;
    if (!form) return;
    const ev = new SubmitEvent('submit', {
      cancelable: true,
      bubbles: true,
    });
    if (form.dispatchEvent(ev)) {
      form.submit();
    }
  }

  /**
   * Returns `true` if the form is in a submittable state after performing state checks and validation
   *
   * @param options - PrepareFormSubmissionOptions
   * @returns `true` if submission is possible
   */
  async prepareFormSubmission(
    options: PrepareFormSubmissionOptions = {},
  ): Promise<boolean> {
    const { skipSendingCheck, skipOperationCheck, skipValidation } = options;

    if (
      (!skipSendingCheck && this.sending) ||
      (!skipOperationCheck && !this.canOperation)
    ) {
      return false;
    }

    if (!skipValidation && this.autoValidate) {
      const valid = await this.validate();
      if (!valid) {
        let { acceptInvalidSubmission } = this._props;
        if (typeof acceptInvalidSubmission === 'function') {
          let accepted = false;

          const ctx: FormInvalidSubmissionAcceptorContext = {
            form: this,
            get accepted() {
              return accepted;
            },
            accept() {
              accepted = false;
            },
          };
          acceptInvalidSubmission(ctx);
          acceptInvalidSubmission = accepted;
        }
        if (!acceptInvalidSubmission) {
          this._formContext?.emit('autoValidationFailed', this);
          this.dispatchAutoScroll();
          return false;
        }
      }
    }

    return true;
  }

  protected _dispatchAction(
    options: DispatchFormActionOptions = {},
  ): Promise<void> {
    const fn = this._fnAction.value;
    if (!fn) return Promise.resolve();

    const {
      event = new SubmitEvent('submit', {
        cancelable: true,
        bubbles: true,
      }),
    } = options;

    let canceled = false;

    const ctx: FormActionContext = {
      form: this,
      get canceled() {
        return canceled;
      },
      get event() {
        return event;
      },
      cancel: () => {
        canceled = true;
      },
    };

    const result = fn(ctx);
    if (ctx.canceled || !isPromise(result)) {
      this._formContext?.emit('finishAction', ctx);
      return Promise.resolve();
    }
    this._actionPromise.value = result;
    return result.finally(() => {
      this._actionPromise.value = null;
      this._formContext?.emit('finishAction', ctx);
    });
  }

  /**
   * Dispatch the specified action function
   *
   * @param options - Dispatch option for form action
   */
  async dispatchAction(options: DispatchFormActionOptions = {}): Promise<void> {
    const submittable = await this.prepareFormSubmission(options);
    if (!submittable) return;
    return this._dispatchAction(options);
  }

  /**
   * Handler for form element submission
   *
   * @param ev - Submit event object
   */
  handleSubmit(ev: Event) {
    ev.preventDefault();
    this.prepareFormSubmission().then((submittable) => {
      if (!submittable) return;
      this._formContext.emit('submit', this, ev);
      this._dispatchAction({
        event: ev,
      });
    });
  }
}

export function useForm(
  props: FormProps,
  ctx: FormContext,
  options?: FormOptions,
) {
  const control = new VueForm(props, ctx, options);
  return control;
}
