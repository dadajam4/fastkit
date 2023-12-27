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
  TextFinalizer,
  BuiltinTextFinalizerName,
  BUILTIN_TEXT_FINALIZERS,
} from '../schemes';
import { logger } from '../logger';

export type TextableFinalizerSpec =
  | TextFinalizer
  | BuiltinTextFinalizerName
  | (TextFinalizer | BuiltinTextFinalizerName)[];

function resolveTextableFinalizerSpec(
  raw?: TextableFinalizerSpec,
): TextFinalizer[] | undefined {
  if (!raw) return;
  if (!Array.isArray(raw)) raw = [raw];
  return raw.map((row) =>
    typeof row === 'string' ? BUILTIN_TEXT_FINALIZERS[row] : row,
  );
}

async function finalizeValue(
  value: string | null | undefined,
  finalizers: TextFinalizer[],
) {
  let result: string = nilToEmptyString(value);
  for (const finalizer of finalizers) {
    result = await finalizer(result);
  }
  return result;
}

export function createTextableProps() {
  return {
    ...createFormNodeProps<any>({
      modelValue: {
        type: String,
        default: '',
      },
      defaultValidateTiming: 'blur',
    }),
    ...createAutocompleteableInputProps(),
    ...createPropsOptions({
      /** Minimum number of characters */
      minlength: [String, Number],
      /** maximum number of characters */
      maxlength: [String, Number],
      /** input pattern */
      pattern: [String, RegExp],
      /** placeholder */
      placeholder: String,
      /**
       * Perform capitalization of the input string's first letter when it is entered/edited by the user.
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/autocapitalize
       */
      autocapitalize: String as PropType<FormAutoCapitalize>,
      /**
       * Text correction settings.
       */
      finalizers: [String, Array, Function] as PropType<TextableFinalizerSpec>,
      /**
       * Character counter.
       */
      counter: [Boolean, String, Number] as PropType<boolean | string | number>,
      /**
       * Calculation logic for performing custom character count.
       */
      counterValue: Function as PropType<(value: string) => number>,
      /** Limit the input value based on the maximum character count. */
      limit: Boolean,
    }),
  };
}

export interface TextableCounterSettings {
  maxlength: number;
  counterValue: (value: string) => number;
}

export interface TextableCounterResult {
  length: number;
  maxlength: number;
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
  protected _finalizers: ComputedRef<TextFinalizer[] | undefined>;
  protected _counterSettings: ComputedRef<TextableCounterSettings | undefined>;
  protected _counterResult: ComputedRef<TextableCounterResult | undefined>;
  protected _maxlengthLimit: ComputedRef<number | undefined>;

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

  get finalizers() {
    return this._finalizers?.value;
  }

  get counterSettings() {
    return this._counterSettings.value;
  }

  get counterResult() {
    return this._counterResult.value;
  }

  get maxlengthLimit() {
    return this._maxlengthLimit.value;
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
    this._finalizers = computed(() =>
      resolveTextableFinalizerSpec(props.finalizers),
    );
    this._counterSettings = computed(() => {
      let { counter } = props;
      const maxlength = this._maxlength.value;
      if (counter === true) {
        if (maxlength == null) {
          if (__PLUGBOY_DEV__) {
            logger.warn(
              'When setting the counter, you need to set the maxlength.',
            );
          }
          return;
        }
        counter = maxlength;
      }
      if (!counter) {
        return;
      }
      counter = toInt(counter);
      return {
        maxlength: counter,
        counterValue: props.counterValue || ((value: string) => value.length),
      };
    });

    this._counterResult = computed(() => {
      const { counterSettings } = this;
      if (!counterSettings) return;
      return {
        length: this.validationValue.length,
        maxlength: counterSettings.maxlength,
      };
    });

    this._maxlengthLimit = computed(() => {
      if (!props.limit) return;
      return (
        this.maxlength ||
        (this.counterSettings && this.counterSettings.maxlength)
      );
    });
  }

  emptyValue() {
    return '';
  }

  /**
   * @override
   */
  blurHandler(ev: FocusEvent) {
    this.finalize();
    super.blurHandler(ev);
  }

  protected async _finalize() {
    const { finalizers } = this;
    if (!finalizers) return;
    this.value = await finalizeValue(this.value, finalizers);
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

  protected _setTextValue(value: string) {
    const { maxlengthLimit } = this;
    if (maxlengthLimit) {
      value = value.slice(0, maxlengthLimit);
    }
    this.value = value;
  }

  expose() {
    const _self = this as TextableControl;
    const publicInterface = super.expose();

    return {
      ...publicInterface,
      ..._self._autocompleteable,
      computedMinlength: _self._minlength,
      computedMaxlength: _self._maxlength,
      computedPattern: _self._pattern,
      computedPlaceholder: _self._placeholder,
      computedAutocapitalize: _self._autocapitalize,
      counterSettings: _self._counterSettings,
      counterResult: _self._counterResult,
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
