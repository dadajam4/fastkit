import {
  ExtractPropTypes,
  SetupContext,
  ComputedRef,
  computed,
  PropType,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { toInt, nilToEmptyString } from '@fastkit/helpers';
import {
  minLength as minLengthFactory,
  maxLength as maxLengthFactory,
  pattern as patternFactory,
} from '@fastkit/rules';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import {
  createAutocompletableInputProps,
  createAutocompletableInputControl,
  AutocompletableInputControl,
} from './autocompletable';

import {
  FormAutoCapitalize,
  TextFinalizer,
  BuiltinTextFinalizerName,
  BUILTIN_TEXT_FINALIZERS,
  FormAutoComplete,
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
    // eslint-disable-next-line no-await-in-loop
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
    ...createAutocompletableInputProps(),
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
  readonly _props: TextableProps;

  protected _minlength: ComputedRef<number | undefined>;

  protected _maxlength: ComputedRef<number | undefined>;

  protected _autocompletable: AutocompletableInputControl;

  protected _finalizers: ComputedRef<TextFinalizer[] | undefined>;

  protected _counterSettings: ComputedRef<TextableCounterSettings | undefined>;

  protected _counterResult: ComputedRef<TextableCounterResult | undefined>;

  protected _maxlengthLimit: ComputedRef<number | undefined>;

  /** Minimum number of characters */
  get minlength(): number | undefined {
    return this._minlength.value;
  }

  /** maximum number of characters */
  get maxlength(): number | undefined {
    return this._maxlength.value;
  }

  /** input pattern */
  get pattern(): string | RegExp | undefined {
    return this._props.pattern;
  }

  /** placeholder */
  get placeholder(): string | undefined {
    return this._props.placeholder;
  }

  /**
   * The HTML autocomplete attribute lets web developers specify what if any permission the [user agent](https://developer.mozilla.org/docs/Glossary/User_agent) has to provide automated assistance in filling out form field values, as well as guidance to the browser as to the type of information expected in the field.
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete
   */
  get autocomplete(): FormAutoComplete | undefined {
    return this._autocompletable.computedAutocomplete.value;
  }

  /**
   * Perform capitalization of the input string's first letter when it is entered/edited by the user.
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/autocapitalize
   */
  get autocapitalize(): FormAutoCapitalize | undefined {
    return this._props.autocapitalize;
  }

  /**
   * Text correction settings.
   *
   * @see {@link TextFinalizer}
   */
  get finalizers(): TextFinalizer[] | undefined {
    return this._finalizers?.value;
  }

  /**
   * Character count setting
   *
   * @see {@link TextableCounterSettings}
   */
  get counterSettings(): TextableCounterSettings | undefined {
    return this._counterSettings.value;
  }

  /**
   * Character count result
   *
   * @see {@link TextableCounterResult}
   */
  get counterResult(): TextableCounterResult | undefined {
    return this._counterResult.value;
  }

  /**
   * The maximum number of characters derived from `maxlength` and `counterSettings`
   */
  get maxlengthLimit(): number | undefined {
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
    this._props = props;

    this._autocompletable = createAutocompletableInputControl(props);

    this._minlength = computed(() => {
      const { minlength } = props;
      return minlength == null ? undefined : toInt(minlength);
    });

    this._maxlength = computed(() => {
      const { maxlength } = props;
      return maxlength == null ? undefined : toInt(maxlength);
    });

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
}

export function useTextableControl(
  props: TextableProps,
  ctx: TextableContext,
  options?: TextableControlOptions,
) {
  const control = new TextableControl(props, ctx, options);
  return control;
}
