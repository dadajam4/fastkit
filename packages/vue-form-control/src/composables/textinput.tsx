import {
  PropType,
  ExtractPropTypes,
  SetupContext,
  ComputedRef,
  computed,
  InputHTMLAttributes,
  ref,
  watch,
  onMounted,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createTextableProps,
  createTextableEmits,
  TextableControl,
  TextableControlOptions,
  TextableContext,
} from './textable';
import {
  TextInputType,
  TextInputMode,
  IMaskTypedValue,
  IMaskEvent,
} from '../schemes';
import { createMaskControlProps, IMaskInstance } from './imask';
import {
  useIMaskControl,
  IMaskControl,
  type AnyMaskedOptions,
  type IMaskPipeType,
} from './imask';

export type TextInputMaskModel = 'masked' | 'typed' | 'unmasked';

const IMASK_PIPE_TYPE_MAP: Record<TextInputMaskModel, IMaskPipeType> = {
  masked: 'value',
  typed: 'typedValue',
  unmasked: 'unmaskedValue',
};

export function createTextInputNodeProps() {
  return {
    ...createTextableProps(),
    ...createMaskControlProps(),
    ...createPropsOptions({
      /**
       * Input type
       *
       * @default "text"
       */
      type: {
        type: String as PropType<TextInputType>,
        default: 'text',
      },
      /**
       * Enumerated attribute that hints at the type of data that might be entered by the user while editing the element or its contents.
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/inputmode
       */
      inputmode: String as PropType<TextInputMode>,
      /**
       * The synchronization method for utilizing the masked modelValue.
       *
       * Typically, when using the mask option, the masked and formatted value is sent along with the event. By enabling this setting, it becomes possible to synchronize unmasked values or resolved values of types.
       */
      maskModel: {
        type: String as PropType<TextInputMaskModel>,
        default: 'masked',
      },
    }),
  };
}

export type TextInputNodeProps = ExtractPropTypes<
  ReturnType<typeof createTextInputNodeProps>
>;

export function createTextInputNodeEmits() {
  return {
    ...createTextableEmits(),
    /**
     * 'accept' event fired on input when mask value has changed
     *
     * @see https://imask.js.org/guide.html
     */
    acceptMask: (ev: IMaskEvent) => true,
    /**
     * Metadata event when the applied mask is changed in dynamic mask settings.
     */
    acceptDynamicMaskMeta: (meta?: any) => true,
    /**
     * 'complete' event fired when the value is completely filled
     *
     * @see https://imask.js.org/guide.html
     */
    completeMask: (ev: IMaskEvent) => true,
    /**
     * Updating the masked value.
     *
     * @param maskedValue - Masked value
     */
    'update:masked': (maskedValue: string) => true,
    /**
     * Updating the normalized value with the specified type.
     *
     * @param typedValue - Normalized value with the specified type
     */
    'update:typed': (typedValue: IMaskTypedValue | undefined) => true,
    /**
     * Updating the unmasked value.
     *
     * @param unmaskedValue - unmasked value
     */
    'update:unmasked': (unmaskedValue: string) => true,
  };
}

export type TextInputNodeEmits = ReturnType<typeof createTextInputNodeEmits>;

export function createTextInputNodeSettings() {
  const props = createTextInputNodeProps();
  const emits = createTextInputNodeEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextInputNodeEmitOptions
  extends ReturnType<typeof createTextInputNodeEmits> {}

export type TextInputNodeContext = SetupContext<TextInputNodeEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextInputNodeControlOptions extends TextableControlOptions {}

export class TextInputNodeControl extends TextableControl {
  readonly _props: TextInputNodeProps;
  protected _inputElement = ref<HTMLInputElement | null>(null);
  protected readonly _getMaskInput: () => AnyMaskedOptions | undefined;
  protected readonly _getMask: () => IMaskInstance | null;
  readonly mask: IMaskControl;
  protected _passwordVisibility = ref(false);
  protected _maskedValue: ComputedRef<string>;

  /**
   * Input type
   *
   * @see {@link TextInputType}
   */
  get type(): TextInputType {
    return this._props.type;
  }

  /**
   * Enumerated attribute that hints at the type of data that might be entered by the user while editing the element or its contents.
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/inputmode
   */
  get inputmode(): TextInputMode | undefined {
    return this._props.inputmode;
  }

  /**
   * `<input />` Element
   */
  get inputElement(): HTMLInputElement | null {
    return this._inputElement.value;
  }

  /**
   * Show password
   */
  get isVisiblePassword(): boolean {
    return this._passwordVisibility.value;
  }

  /**
   * Masked text
   */
  get maskedValue(): string {
    return this._maskedValue.value;
  }

  /**
   * Use the unmasked value
   */
  get useUnmaskedValue(): boolean {
    return this._props.maskModel === 'unmasked';
  }

  /**
   * Use the type-corrected value
   */
  get useTypedValue(): boolean {
    return this._props.maskModel === 'typed';
  }

  constructor(
    props: TextInputNodeProps,
    ctx: TextInputNodeContext,
    options: TextInputNodeControlOptions = {},
  ) {
    super(props, ctx as unknown as TextableContext, {
      ...options,
    });
    this._props = props;

    const { emit } = ctx;
    const el = ref<null | HTMLInputElement>(null);
    this._inputElement = el;

    this._handleNodeInput = this._handleNodeInput.bind(this);

    const imask = useIMaskControl(props, {
      el,
      onAccept: (ev) => {
        const { masked, unmasked, typed } = imask;
        emit('acceptMask', ev);
        const bucket = this.useUnmaskedValue
          ? unmasked
          : this.useTypedValue
          ? typed
          : masked;

        const value = bucket.value;

        if (this.setValue(value as any)) {
          emit('update:masked', masked.value);
          emit('update:unmasked', unmasked.value);
          emit('update:typed', typed.value);
        }
      },
      onAcceptDynamicMeta: (meta) => {
        ctx.emit('acceptDynamicMaskMeta', meta);
      },
      onComplete: (ev) => {
        emit('completeMask', ev);
      },
    });

    this.mask = imask;

    const { maskInput, masked, unmasked, typed, inputMask } = imask;

    this._maskedValue = computed(() => {
      const from = IMASK_PIPE_TYPE_MAP[props.maskModel];
      return imask.pipe(this.value, from);
    });
    this._getMaskInput = () => maskInput.value;
    this._getMask = () => inputMask.value;
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);

    watch(this._value, (v) => {
      if (!this._getMaskInput()) return;
      const bucket = this.useUnmaskedValue
        ? unmasked
        : this.useTypedValue
        ? typed
        : masked;

      bucket.value = v || '';
    });

    /**
     * @TODO ちゃんとする
     */
    onMounted(() => {
      if (props.autofocus) {
        setTimeout(() => {
          this.focus();
        }, 250);
      }
    });

    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
  }

  emptyValue() {
    return '';
  }

  /**
   * Set the visibility state of the password
   *
   * @param visibility - Password visibility state
   */
  setPasswordVisibility(visibility: boolean): void {
    this._passwordVisibility.value = visibility;
  }

  /**
   * Toggle the visibility state of the password
   */
  togglePasswordVisibility(): void {
    this.setPasswordVisibility(!this.isVisiblePassword);
  }

  protected _handleNodeInput(ev: Event) {
    this._setTextValue((ev.target as unknown as HTMLInputElement).value);
  }

  createInputElement(
    override: Pick<InputHTMLAttributes, 'class' | 'type'> = {},
  ) {
    let type = override.type || this.type;
    if (type === 'password' && this.isVisiblePassword) {
      type = 'text';
    }

    const maskInput = this._getMaskInput();

    const attrs: InputHTMLAttributes = {
      class: override.class,
      type,
      inputmode: this.inputmode,
      name: this.name,
      tabindex: this.tabindex,
      readonly: this.isReadonly,
      disabled: this.isDisabled,
      placeholder: this.placeholder,
      autocomplete: this.autocomplete,
      autocapitalize: this.autocapitalize,
      spellcheck: this.spellcheck,
      maxlength: this.maxlength,
      onFocus: this.focusHandler,
      onBlur: this.blurHandler,
    };

    if (!maskInput) {
      attrs.value = this.value;
      attrs.onInput = this._handleNodeInput;
    } else {
      if (!this.isMounted) {
        attrs.value = this.value;
      } else {
        const mask = this._getMask();
        attrs.value = mask?.masked?.value;
      }
    }
    const el = <input {...attrs} ref={this._inputElement} />;
    return el;
  }

  focus(opts?: FocusOptions) {
    if (this.isDisabled) return;
    const { inputElement } = this;
    inputElement && inputElement.focus(opts);
  }

  blur() {
    const { inputElement } = this;
    inputElement && inputElement.blur();
  }
}

export function useTextInputNodeControl(
  props: TextInputNodeProps,
  ctx: TextInputNodeContext,
  options?: TextInputNodeControlOptions,
) {
  const control = new TextInputNodeControl(props, ctx, options);
  return control;
}
