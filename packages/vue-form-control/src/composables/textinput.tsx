import {
  PropType,
  ExtractPropTypes,
  SetupContext,
  ComputedRef,
  computed,
  InputHTMLAttributes,
  ref,
  Ref,
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
import { TextInputType, IMaskTypedValue, IMaskEvent } from '../schemes';
// import { AnyMaskedOptions } from 'imask';
import { notEmptyValue } from '@fastkit/helpers';
import { createMaskControlProps } from './imask';
import { useIMaskControl } from './imask';
// type AnyMaskedOptions = any;

export function createTextInputProps() {
  return {
    ...createTextableProps(),
    ...createMaskControlProps(),
    ...createPropsOptions({
      type: {
        type: String as PropType<TextInputType>,
        default: 'text',
      },
      masked: String,
      typed: [String, Number, Date],
      unmasked: String,
    }),
  };
}

export type TextInputProps = ExtractPropTypes<
  ReturnType<typeof createTextInputProps>
>;

export function createTextInputEmits() {
  return {
    ...createTextableEmits(),
    accept: (ev: IMaskEvent) => true,
    complete: (ev: IMaskEvent) => true,
    'update:masked': (maskedValue: string) => true,
    'update:typed': (typedValue: IMaskTypedValue | undefined) => true,
    'update:unmasked': (unmaskedValue: string) => true,
  };
}

export type TextInputEmits = ReturnType<typeof createTextInputEmits>;

export function createTextInputSettings() {
  const props = createTextInputProps();
  const emits = createTextInputEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextInputEmitOptions
  extends ReturnType<typeof createTextInputEmits> {}

export type TextInputContext = SetupContext<TextInputEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextInputControlOptions extends TextableControlOptions {}

export class TextInputControl extends TextableControl {
  // protected _mask: ComputedRef<AnyMaskedOptions | undefined>;
  protected _mask: ComputedRef<any | undefined>;
  protected _type: ComputedRef<TextInputType>;
  protected _inputElement = ref<HTMLInputElement | null>(null);
  protected _masked: Ref<string>;
  protected _unmasked: Ref<string>;
  protected _typed: Ref<IMaskTypedValue | undefined>;

  get mask() {
    return this._mask.value;
  }

  get type() {
    return this._type.value;
  }

  get inputElement() {
    return this._inputElement.value;
  }

  get masked() {
    return this._masked.value;
  }

  get unmasked() {
    return this._unmasked.value;
  }

  get typed() {
    return this._typed.value;
  }

  constructor(
    props: TextInputProps,
    ctx: TextInputContext,
    options: TextInputControlOptions = {},
  ) {
    super(props, ctx as unknown as TextableContext, {
      ...options,
    });

    const { emit } = ctx;
    const el = ref<null | HTMLInputElement>(null);
    this._inputElement = el;

    const { masked, unmasked, typed } = useIMaskControl(props, {
      el,
      onAccept: (ev) => {
        emit('accept', ev);
        const v = masked.value;
        if (this.setValue(v)) {
          emit('update:masked', v);
          emit('update:unmasked', unmasked.value);
          emit('update:typed', typed.value);
        }
      },
      onComplete: (ev) => {
        emit('complete', ev);
      },
    });

    this._masked = ref(notEmptyValue([props.masked, this.value], ''));
    this._unmasked = ref(notEmptyValue([props.unmasked], ''));
    this._typed = ref(notEmptyValue([props.typed]));
    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);

    watch(
      () => props.modelValue,
      (v) => (this._masked.value = this.value),
    );
    watch(
      () => props.unmasked,
      (v) => (this._unmasked.value = notEmptyValue([v], '')),
    );
    watch(
      () => props.typed,
      (v) => (this._typed.value = v),
    );

    this._mask = computed(() => {
      const { mask } = props;
      if (!mask) return;
      return typeof mask === 'string' ? { mask } : mask;
    });

    this._type = computed(() => props.type);

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
  }

  emptyValue() {
    return '';
  }

  expose() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _self = this;
    const publicInterface = super.expose();

    return {
      ...publicInterface,
      textInputControl: this as TextInputControl,
      computedMask: _self._mask,
      computedType: _self._type,
      inputElementRef: _self._inputElement,
      focus: _self.focus,
      blur: _self.blur,
    };
  }

  createInputElement(override: Pick<InputHTMLAttributes, 'class'> = {}) {
    const attrs: InputHTMLAttributes = {
      class: override.class,
      type: this.type,
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
      value: this.value,
    };
    const { mask } = this;
    if (!mask || !mask.mask) {
      attrs.onInput = (ev) => {
        this._setTextValue((ev.target as unknown as HTMLInputElement).value);
      };
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

export function useTextInputControl(
  props: TextInputProps,
  ctx: TextInputContext,
  options?: TextInputControlOptions,
) {
  const control = new TextInputControl(props, ctx, options);
  return control;
}
