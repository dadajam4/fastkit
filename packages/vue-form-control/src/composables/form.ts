import {
  ExtractPropTypes,
  SetupContext,
  provide,
  PropType,
  ComputedRef,
  computed,
  ref,
  onBeforeUnmount,
  watch,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createFormGroupProps,
  createFormGroupEmits,
  FormGroupOptions,
  FormGroupControl,
} from './group';
import { FormInjectionKey } from '../injections';
import { isPromise } from '@fastkit/helpers';

export interface FormActionContext {
  form: VueForm;
  canceled: boolean;
  cancel: () => void;
  event: Event;
}

export type FormActionHandler = (ctx: FormActionContext) => any;

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

export interface FormOptions extends FormGroupOptions {
  // onAutoValidateError?: VueFormHook;
}

export function createFormProps(options: FormOptions = {}) {
  return {
    ...createFormGroupProps(),
    ...createPropsOptions({
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
       * Auto scroll to the location of the form when invalid input is detected in the validation on submission
       */
      disableAutoScroll: Boolean,
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
  };
}

export function createFormSettings(options?: FormOptions) {
  const props = createFormProps(options);
  const emits = createFormEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormEmitOptions extends ReturnType<typeof createFormEmits> {}

export type FormContext = SetupContext<FormEmitOptions>;

export class VueForm extends FormGroupControl {
  readonly _props: FormProps;
  protected _formContext: FormContext;
  protected _nativeAction: ComputedRef<string | undefined>;
  protected _fnAction: ComputedRef<FormActionHandler | undefined>;
  protected _formRef = ref<HTMLFormElement | null>(null);
  protected _actionPromise = ref<Promise<any> | null>(null);
  protected _sending: ComputedRef<boolean>;

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
   * Auto scroll to the location of the form when invalid input is detected in the validation on submission
   */
  get disableAutoScroll() {
    return this._props.disableAutoScroll;
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

    onBeforeUnmount(() => {
      this._actionPromise.value = null;
      delete (this as any)._formContext;
    });

    (['submit', 'handleSubmit', 'formRef'] as const).forEach((fn) => {
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
   * Dispatch the specified action function
   *
   * @param event - Event object
   */
  dispatchAction(event?: Event): Promise<void> {
    if (!event) {
      event = new SubmitEvent('submit', {
        cancelable: true,
        bubbles: true,
      });
    }
    const fn = this._fnAction.value;
    if (!fn) return Promise.resolve();

    const ctx: FormActionContext = {
      form: this,
      canceled: false,
      cancel: () => {
        ctx.canceled = true;
      },
      event,
    };
    const result = fn(ctx);
    if (ctx.canceled || !isPromise(result)) return Promise.resolve();
    this._actionPromise.value = result;
    return result.finally(() => {
      this._actionPromise.value = null;
    });
  }

  async validateAndScroll(): Promise<boolean> {
    const valid = await this.validate();
    if (!valid) {
      !this.disableAutoScroll && this.scrollToFirstInvalidNode();
    }
    return valid;
  }

  async handleSubmit(ev: Event) {
    ev.preventDefault();
    if (this.sending || this.isDisabled || this.isReadonly) return;
    if (this.autoValidate) {
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
          !this.disableAutoScroll && this.scrollToFirstInvalidNode();
          return;
        }
      }
    }
    this._formContext.emit('submit', this, ev);
    this.dispatchAction(ev);
  }

  formRef() {
    return this._formRef;
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
