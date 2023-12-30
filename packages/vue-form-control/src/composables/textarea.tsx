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

export function createTextareaNodeProps(
  options: TextareaNodeControlOptions = {},
) {
  return {
    ...createTextableProps(),
    ...createMaskControlProps(),
    ...createPropsOptions({
      /** Automatically adjust the height of the box based on the number of input lines. */
      autosize: [Boolean, Object] as PropType<RawTextareaAutosizeSettings>,
      /** Size (number of lines) of the input box. */
      rows: {
        ...NumberishPropOption,
        default: options.defaultRows,
      },
    }),
  };
}

export type TextareaNodeProps = ExtractPropTypes<
  ReturnType<typeof createTextareaNodeProps>
>;

export function createTextareaNodeEmits() {
  return {
    ...createTextableEmits(),
  };
}

export function createTextareaNodeSettings(
  options?: TextareaNodeControlOptions,
) {
  const props = createTextareaNodeProps(options);
  const emits = createTextareaNodeEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextareaNodeEmitOptions
  extends ReturnType<typeof createTextareaNodeEmits> {}

export type TextareaNodeContext = SetupContext<TextareaNodeEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextareaNodeControlOptions extends TextableControlOptions {
  defaultRows?: number;
}

export class TextareaNodeControl extends TextableControl {
  readonly _props: TextareaNodeProps;
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
    props: TextareaNodeProps,
    ctx: TextareaNodeContext,
    options: TextareaNodeControlOptions = {},
  ) {
    super(props, ctx as unknown as TextableContext, {
      ...options,
    });
    this._props = props;

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
          modelValue={attrs.value as string}
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

export function useTextareaNodeControl(
  props: TextareaNodeProps,
  ctx: TextareaNodeContext,
  options?: TextareaNodeControlOptions,
) {
  const control = new TextareaNodeControl(props, ctx, options);
  return control;
}
