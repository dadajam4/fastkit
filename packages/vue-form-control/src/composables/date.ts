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
import { minDate as _minDate, maxDate as _maxDate } from '@fastkit/rules';
import { DateInputPrecision, parseDateInput } from '@fastkit/helpers';

const minDate = _minDate.fork({ name: 'min' });
const maxDate = _maxDate.fork({ name: 'max' });

function safeValue(value: any, precision: DateInputPrecision) {
  if (typeof value !== 'string') return '';
  const parsed = parseDateInput(value);
  if (!parsed || parsed.precision !== precision) return '';
  return parsed.source;
}

export function createDateInputProps(options: DateInputControlOptions = {}) {
  return {
    ...createFormNodeProps({
      modelValue: {
        type: String,
        default: '',
      },
    }),
    ...createPropsOptions({
      min: [String, Number, Date],
      max: [String, Number, Date],
      precision: {
        type: String as PropType<DateInputPrecision>,
        default: options.defaultPrecision || 'date',
      },
    }),
  };
}
export type DateInputProps = ExtractPropTypes<
  ReturnType<typeof createDateInputProps>
>;

export function createDateInputEmits() {
  return {
    ...createFormNodeEmits({ modelValue: String }),
  };
}

export function createDateInputSettings(options?: DateInputControlOptions) {
  const props = createDateInputProps(options);
  const emits = createDateInputEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateInputEmitOptions
  extends ReturnType<typeof createDateInputEmits> {}

export type DateInputContext = SetupContext<DateInputEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateInputControlOptions extends FormNodeControlBaseOptions {
  defaultPrecision?: DateInputPrecision;
}

export class DateInputControl extends FormNodeControl<string> {
  protected _min: ComputedRef<Date | undefined>;
  protected _max: ComputedRef<Date | undefined>;
  protected _precision: ComputedRef<DateInputPrecision>;

  get computedMin() {
    return this._min.value;
  }

  get computedMax() {
    return this._max.value;
  }

  get precision() {
    return this._precision.value;
  }

  constructor(
    props: DateInputProps,
    ctx: DateInputContext,
    options?: DateInputControlOptions,
  ) {
    super(props, ctx as unknown as FormNodeContext<string>, {
      ...options,
      modelValue: String,
    });

    this._min = computed(() => {
      const { min } = props;
      return min == null ? undefined : new Date(min);
    });

    this._max = computed(() => {
      const { max } = props;
      return max == null ? undefined : new Date(max);
    });

    this._precision = computed(() => props.precision);
  }

  emptyValue() {
    return '';
  }

  safeModelValue(value: any) {
    if (value == null) {
      return this.emptyValue();
    }
    return safeValue(value, this.precision);
  }

  protected _resolveRules() {
    const rules = super._resolveRules();
    const { computedMin, computedMax } = this;
    if (computedMin) {
      rules.push(minDate(computedMin));
    }
    if (computedMax) {
      rules.push(maxDate(computedMax));
    }
    return rules;
  }

  expose() {
    // const _self = this as DateInputControl;
    const publicInterface = super.expose();

    return {
      ...publicInterface,
      computedMin: this._min,
      computedMax: this._max,
      computedPrecision: this._precision,
    };
  }
}

export function useDateInputControl(
  props: DateInputProps,
  ctx: DateInputContext,
  options?: DateInputControlOptions,
) {
  const control = new DateInputControl(props, ctx, options);
  return control;
}
