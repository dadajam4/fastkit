import {
  ExtractPropTypes,
  SetupContext,
  ref,
  TextareaHTMLAttributes,
  PropType,
  ComputedRef,
  computed,
  VNode,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createTextableProps,
  createTextableEmits,
  TextableControl,
  TextableControlOptions,
  TextableContext,
} from './textable';
import { createMaskControlProps } from './imask';
import {
  VTextareaAutosize,
  VTextareaAutosizeRef,
} from '../components/VTextareaAutosize';
import { NumberishPropOption, resolveNumberish } from '@fastkit/vue-utils';

export interface TextareaAutosizeSettings {
  minRows?: number;
  maxRows?: number;
}

export type RawTextareaAutosizeSettings =
  | undefined
  | boolean
  | TextareaAutosizeSettings;

function resolveRawTextareaAutosizeSettings(
  raw: RawTextareaAutosizeSettings,
): TextareaAutosizeSettings | undefined {
  if (!raw) return;
  return typeof raw === 'boolean' ? {} : raw;
}

export function createTextareaProps(options: TextareaControlOptions = {}) {
  return {
    ...createTextableProps(),
    ...createMaskControlProps(),
    ...createPropsOptions({
      autosize: [Boolean, Object] as PropType<RawTextareaAutosizeSettings>,
      rows: {
        ...NumberishPropOption,
        default: options.defaultRows,
      },
    }),
  };
}

export type TextareaProps = ExtractPropTypes<
  ReturnType<typeof createTextareaProps>
>;

export function createTextareaEmits() {
  return {
    ...createTextableEmits(),
  };
}

export function createTextareaSettings(options?: TextareaControlOptions) {
  const props = createTextareaProps(options);
  const emits = createTextareaEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextareaEmitOptions
  extends ReturnType<typeof createTextareaEmits> {}

export type TextareaContext = SetupContext<TextareaEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextareaControlOptions extends TextableControlOptions {
  defaultRows?: number;
}

export class TextareaControl extends TextableControl {
  protected _inputElement = ref<
    HTMLTextAreaElement | VTextareaAutosizeRef | null
  >(null);
  protected _autosize: ComputedRef<TextareaAutosizeSettings | undefined>;
  protected _rows: ComputedRef<number | undefined>;

  get inputElement() {
    return this._inputElement.value;
  }

  get autosizeSettings() {
    return this._autosize.value;
  }

  get rows() {
    return this._rows.value;
  }

  constructor(
    props: TextareaProps,
    ctx: TextareaContext,
    options: TextareaControlOptions = {},
  ) {
    super(props, ctx as unknown as TextableContext, {
      ...options,
    });

    const el = ref<null | HTMLTextAreaElement | VTextareaAutosizeRef>(null);
    this._inputElement = el;

    this._autosize = computed(() =>
      resolveRawTextareaAutosizeSettings(props.autosize),
    );

    this._rows = computed(() =>
      resolveNumberish(props.rows || options.defaultRows),
    );

    this.focus = this.focus.bind(this);
    this.blur = this.blur.bind(this);
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
      textareaControl: this as TextareaControl,
      inputElementRef: _self._inputElement,
      autosizeSettings: this._autosize,
      focus: _self.focus,
      blur: _self.blur,
    };
  }

  createInputElement(override: Pick<TextareaHTMLAttributes, 'class'> = {}) {
    const { autosizeSettings } = this;
    const attrs: TextareaHTMLAttributes = {
      class: override.class,
      name: this.name,
      tabindex: this.tabindex,
      readonly: this.isReadonly,
      disabled: this.isDisabled,
      placeholder: this.placeholder,
      autocomplete: this.autocomplete,
      autocapitalize: this.autocapitalize,
      spellcheck: this.spellcheck,
      rows: this.rows,
      maxlength: this.maxlength,
      onFocus: this.focusHandler,
      onBlur: this.blurHandler,
      value: this.value,
      onInput: (ev) => {
        this._setTextValue((ev.target as unknown as HTMLTextAreaElement).value);
      },
    };
    let el: VNode;
    if (autosizeSettings) {
      el = (
        <VTextareaAutosize
          {...attrs}
          {...autosizeSettings}
          ref={this._inputElement}
        />
      );
    } else {
      attrs.rows = this.rows;
      el = <textarea {...attrs} ref={this._inputElement} />;
    }
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

export function useTextareaControl(
  props: TextareaProps,
  ctx: TextareaContext,
  options?: TextareaControlOptions,
) {
  const control = new TextareaControl(props, ctx, options);
  return control;
}
