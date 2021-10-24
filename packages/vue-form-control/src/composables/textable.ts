import {
  ExtractPropTypes,
  SetupContext,
  ComputedRef,
  computed,
  PropType,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import { toInt, nilToEmptyString } from '@fastkit/helpers';
import {
  minLength as minLengthFactory,
  maxLength as maxLengthFactory,
  pattern as patternFactory,
} from '@fastkit/rules';
import {
  createAutocompleteableInputProps,
  createAutocompleteableInputControl,
  AutocompleteableInputControl,
} from './autocompleteable';
import {
  FormAutoCapitalize,
  TextFinishingFn,
  BuiltinTextFinishingFnName,
  BUILTIN_TEXT_FINISHINGS,
} from '../schemes';

export type RawTextableFinishingProp =
  | TextFinishingFn
  | BuiltinTextFinishingFnName
  | (TextFinishingFn | BuiltinTextFinishingFnName)[];

function resolveRawTextableFinishingProp(
  raw?: RawTextableFinishingProp,
): TextFinishingFn[] | undefined {
  if (!raw) return;
  if (!Array.isArray(raw)) raw = [raw];
  return raw.map((row) =>
    typeof row === 'string' ? BUILTIN_TEXT_FINISHINGS[row] : row,
  );
}

function finishingValue(
  value: string | null | undefined,
  finishings: TextFinishingFn[],
) {
  let result: string = nilToEmptyString(value);
  finishings.forEach((finishing) => {
    result = finishing(value);
  });
  return result;
}

export function createTextableProps() {
  return {
    ...createFormNodeProps({
      modelValue: {
        type: String,
        default: '',
      },
      defaultValidateTiming: 'blur',
    }),
    ...createAutocompleteableInputProps(),
    ...createPropsOptions({
      minlength: [String, Number],
      maxlength: [String, Number],
      pattern: [String, RegExp],
      placeholder: String,
      autocapitalize: String as PropType<FormAutoCapitalize>,
      finishings: [String, Array] as PropType<RawTextableFinishingProp>,
    }),
  };
}

export type TextableProps = ExtractPropTypes<
  ReturnType<typeof createTextableProps>
>;

export function createTextableEmits() {
  return {
    ...createFormNodeEmits({ modelValue: String }),
  };
}

export function createTextableSettings() {
  const props = createTextableProps();
  const emits = createTextableEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextableEmitOptions
  extends ReturnType<typeof createTextableEmits> {}

export type TextableContext = SetupContext<TextableEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TextableControlOptions extends FormNodeControlBaseOptions {}

export class TextableControl extends FormNodeControl<string> {
  protected _minlength: ComputedRef<number | undefined>;
  protected _maxlength: ComputedRef<number | undefined>;
  protected _pattern: ComputedRef<string | RegExp | undefined>;
  protected _placeholder: ComputedRef<string | undefined>;
  protected _autocompleteable: AutocompleteableInputControl;
  protected _autocapitalize: ComputedRef<FormAutoCapitalize | undefined>;
  protected _finishings: ComputedRef<TextFinishingFn[] | undefined>;

  get minlength() {
    return this._minlength.value;
  }

  get maxlength() {
    return this._maxlength.value;
  }

  get pattern() {
    return this._pattern.value;
  }

  get placeholder() {
    return this._placeholder.value;
  }

  get autocomplete() {
    return this._autocompleteable.computedAutocomplete.value;
  }

  get autocapitalize() {
    return this._autocapitalize.value;
  }

  get finishings() {
    return this._finishings.value;
  }

  constructor(
    props: TextableProps,
    ctx: TextableContext,
    options: TextableControlOptions = {},
  ) {
    super(props, ctx as unknown as FormNodeContext<string>, {
      ...options,
      modelValue: String,
    });

    this._autocompleteable = createAutocompleteableInputControl(props);

    this._minlength = computed(() => {
      const { minlength } = props;
      return minlength == null ? undefined : toInt(minlength);
    });

    this._maxlength = computed(() => {
      const { maxlength } = props;
      return maxlength == null ? undefined : toInt(maxlength);
    });

    this._pattern = computed(() => props.pattern);
    this._placeholder = computed(() => props.placeholder);
    this._autocapitalize = computed(() => props.autocapitalize);
    this._finishings = computed(() =>
      resolveRawTextableFinishingProp(props.finishings),
    );
  }

  emptyValue() {
    return '';
  }

  /**
   * @override
   */
  blurHandler(ev: FocusEvent) {
    this.finishing();
    super.blurHandler(ev);
  }

  finishing() {
    const { finishings } = this;
    if (!finishings) return;
    this.value = finishingValue(this.value, finishings);
  }

  protected _resolveRules() {
    const rules = super._resolveRules();
    if (!this.booted) return rules;
    const { pattern, minlength, maxlength } = this;
    if (pattern != null) {
      rules.push(patternFactory(pattern));
    }
    if (minlength != null) {
      rules.push(minLengthFactory(minlength));
    }
    if (maxlength != null) {
      rules.push(maxLengthFactory(maxlength));
    }
    return rules;
  }

  expose() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _self = this;
    const publicInterface = super.expose();

    return {
      ...publicInterface,
      ..._self._autocompleteable,
      computedMinlength: _self._minlength,
      computedMaxlength: _self._maxlength,
      computedPattern: _self._pattern,
      computedPlaceholder: _self._placeholder,
      computedAutocapitalize: _self._autocapitalize,
    };
  }
}

export function useTextableControl(
  props: TextableProps,
  ctx: TextableContext,
  options?: TextableControlOptions,
) {
  const control = new TextableControl(props, ctx, options);
  return control;
}
