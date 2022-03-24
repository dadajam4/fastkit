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
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import { FormInjectionKey } from '../injections';
import { isPromise } from '@fastkit/helpers';

export interface FormActionContext {
  form: VueForm;
  canceled: boolean;
  cancel: () => void;
  event: Event;
}

export type FormFunctionableAction = (ctx: FormActionContext) => any;

export type FormAction = string | FormFunctionableAction;

export function createFormProps(options: FormOptions = {}) {
  return {
    ...createFormNodeProps(),
    ...createPropsOptions({
      action: [String, Function] as PropType<FormAction>,
      autoValidate: {
        type: Boolean,
        default: true,
      },
      submiting: Boolean,
      disableAutoScroll: Boolean,
    }),
  };
}

export type FormProps = ExtractPropTypes<ReturnType<typeof createFormProps>>;

export function createFormEmits() {
  return {
    ...createFormNodeEmits(),
    submit: (form: VueForm, ev: Event) => true,
    'update:submiting': (submiting: boolean, form: VueForm) => true,
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

export type VueFormHook = (form: VueForm) => any;
export interface FormOptions extends FormNodeControlBaseOptions {
  onAutoValidateError?: VueFormHook;
  scrollToElement?: (element: HTMLElement) => any;
}

export class VueForm extends FormNodeControl {
  protected _formContext: FormContext;
  protected _autoValidate: ComputedRef<boolean>;
  protected _nativeAction: ComputedRef<string | undefined>;
  protected _disableAutoScroll: ComputedRef<boolean>;
  protected _fnAction: ComputedRef<FormFunctionableAction | undefined>;
  protected _formRef = ref<HTMLFormElement | null>(null);
  protected _actionPromise = ref<Promise<any> | null>(null);
  protected _submiting: ComputedRef<boolean>;
  protected _onAutoValidateError?: VueFormHook;
  protected _scrollToElement?: (element: HTMLElement) => any;

  get submiting() {
    return this._submiting.value;
  }

  get autoValidate() {
    return this._autoValidate.value;
  }

  get disableAutoScroll() {
    return this._disableAutoScroll.value;
  }

  constructor(props: FormProps, ctx: FormContext, options: FormOptions = {}) {
    super(props, ctx as unknown as FormNodeContext<{}>, {
      ...options,
    });
    this._formContext = ctx;
    this._autoValidate = computed(() => props.autoValidate);
    this._disableAutoScroll = computed(() => props.disableAutoScroll);
    this._nativeAction = computed(() => {
      if (typeof props.action === 'string') return props.action;
      return undefined;
    });
    this._fnAction = computed(() => {
      if (typeof props.action === 'function') return props.action;
      return undefined;
    });
    this._submiting = computed(
      () => props.submiting || this._actionPromise.value !== null,
    );
    this._onAutoValidateError = options.onAutoValidateError;
    this._scrollToElement = options.scrollToElement;

    onBeforeUnmount(() => {
      this._actionPromise.value = null;
      delete this._onAutoValidateError;
      delete this._scrollToElement;
      delete (this as any)._formContext;
    });

    (['submit', 'handleSubmit'] as const).forEach((fn) => {
      const _fn = this[fn];
      this[fn] = _fn.bind(this) as any;
    });

    watch(
      () => this._submiting.value,
      (submiting) => {
        ctx.emit('update:submiting', submiting, this);
      },
    );

    provide(FormInjectionKey, this);
  }

  submit() {
    const form = this._formRef.value;
    if (form) {
      form.submit();
    }
  }

  protected _doAction(event: Event) {
    const fn = this._fnAction.value;
    if (!fn) return;
    const ctx: FormActionContext = {
      form: this,
      canceled: false,
      cancel: () => {
        ctx.canceled = true;
      },
      event,
    };
    const result = fn(ctx);
    if (ctx.canceled || !isPromise(result)) return;
    this._actionPromise.value = result;
    result.finally(() => {
      this._actionPromise.value = null;
    });
  }

  scrollToFirstInvalidElement() {
    const { firstInvalidEl, _scrollToElement } = this;
    if (!_scrollToElement || !firstInvalidEl) return;
    return _scrollToElement(firstInvalidEl);
  }

  async validateAndScroll(): Promise<boolean> {
    const valid = await this.validate();
    if (!valid) {
      !this.disableAutoScroll && this.scrollToFirstInvalidElement();
    }
    return valid;
  }

  async handleSubmit(ev: Event) {
    ev.preventDefault();
    if (this.submiting || this.isDisabled || this.isReadonly) return;
    if (this.autoValidate) {
      const valid = await this.validateAndScroll();
      if (!valid) {
        this._onAutoValidateError && this._onAutoValidateError(this);
        return;
      }
    }
    this._formContext.emit('submit', this, ev);
    this._doAction(ev);
  }

  expose() {
    const publicInterface = super.expose();
    return {
      ...publicInterface,
      form: this as VueForm,
      formRef: () => this._formRef,
      nativeAction: this._nativeAction,
      disableAutoScroll: this._disableAutoScroll,
    };
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
