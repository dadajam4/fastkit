import { ExtractPropTypes, SetupContext, ComputedRef, computed } from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import { toInt } from '@fastkit/helpers';
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

export function createTextInputProps() {
  return {
    ...createFormNodeProps({
      modelValue: {
        type: String,
        default: '',
      },
    }),
    ...createAutocompleteableInputProps(),
    ...createPropsOptions({
      minlength: [String, Number],
      maxlength: [String, Number],
      pattern: [String, RegExp],
      placeholder: String,
    }),
  };
}
export type TextInputProps = ExtractPropTypes<
  ReturnType<typeof createTextInputProps>
>;

export function createTextInputEmits() {
  return {
    ...createFormNodeEmits({ modelValue: String }),
  };
}

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
export interface TextInputControlOptions extends FormNodeControlBaseOptions {}

export class TextInputControl extends FormNodeControl<string> {
  protected _minlength: ComputedRef<number | undefined>;
  protected _maxlength: ComputedRef<number | undefined>;
  protected _pattern: ComputedRef<string | RegExp | undefined>;
  protected _placeholder: ComputedRef<string | undefined>;
  protected _autocompleteable: AutocompleteableInputControl;

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

  get autocomple() {
    return this._autocompleteable.computedAutocomplete.value;
  }

  constructor(
    props: TextInputProps,
    ctx: TextInputContext,
    options: TextInputControlOptions = {},
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
  }

  emptyValue() {
    return '';
  }

  protected _resolveRules() {
    const rules = super._resolveRules();
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
    };
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
