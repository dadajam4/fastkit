import {
  ExtractPropTypes,
  SetupContext,
  PropType,
  Ref,
  ref,
  computed,
  ComputedRef,
  WritableComputedRef,
  watch,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeControlBaseOptions,
} from './node';
import { createRule, isEmpty } from '@fastkit/rules';

export type BoundableValue = number | string;

/**
 * Required criteria for Boundable inputs
 *
 * - `start` Input of start value is mandatory
 * - `end` Input of end value is mandatory
 * - `any` At least one input is required
 * - `both` Both inputs are mandatory
 */
export type BoundableRequiredConstraints = 'start' | 'end' | 'any' | 'both';

/**
 * Specify of Required criteria for Boundable inputs
 */
export type BoundableRequiredConstraintsSpec =
  | boolean
  | BoundableRequiredConstraints;

export const boundableRequired = createRule<BoundableRequiredConstraints>({
  name: 'boundableRequired',
  validate: (value, type) => {
    if (value == null) return false;
    if (Array.isArray(value)) {
      const [start, end] = value;
      const startIsEmpty = isEmpty(start);
      const endIsEmpty = isEmpty(end);
      if ((type === 'start' || type === 'both') && startIsEmpty) {
        return false;
      }
      if ((type === 'end' || type === 'both') && endIsEmpty) {
        return false;
      }
      if (type === 'any' && (startIsEmpty || endIsEmpty)) {
        return false;
      }
      return true;
    } else {
      return !isEmpty(value);
    }
  },
  message: (value, { constraints: type }) => {
    if (!Array.isArray(value)) {
      return 'The input is required.';
    }
    if (type === 'start') {
      return 'The input of the start value is required.';
    }
    if (type === 'end') {
      return 'The input of the end value is required.';
    }
    if (type === 'any') {
      return 'Either input is required.';
    }
    const [start] = value;
    if (isEmpty(start)) {
      return 'The start value is not entered.';
    } else {
      return 'The end value is not entered.';
    }
  },
  constraints: 'any',
});

export const boundableMin = createRule<BoundableValue>({
  name: 'boundableMin',
  validate: (value, min) => {
    if (value == null) return true;
    if (Array.isArray(value)) {
      return value.every((value) => value >= min);
    } else {
      return value >= min;
    }
  },
  message: (value, { constraints: min }) => {
    if (min != null) {
      return `Must be greater than ${min}.`;
    }
    throw new Error('The constraint settings are incorrect.');
  },
  constraints: 0,
});

export const boundableMax = createRule<BoundableValue>({
  name: 'boundableMax',
  validate: (value, max) => {
    if (value == null) return true;
    if (Array.isArray(value)) {
      return value.every((value) => value <= max);
    } else {
      return value <= max;
    }
  },
  message: (value, { constraints: max }) => {
    if (max != null) {
      return `Must be ${max} or less.`;
    }
    throw new Error('The constraint settings are incorrect.');
  },
  constraints: Infinity,
});

export interface BoundableInputControlPropsOptions<
  T extends BoundableValue = BoundableValue,
  D extends T | null = null,
  DS extends T | null = null,
  DE extends T | null = null,
  Min extends T | null = null,
  Max extends T | null = null,
> extends Pick<FormNodeControlBaseOptions, 'defaultValidateTiming'> {
  type: PropType<T>;
  defaultValue?: D;
  defaultStartValue?: DS;
  defaultEndValue?: DE;
  defaultMin?: Min;
  defaultMax?: Max;
  range?: boolean;
}

const REQUIRED_PROP_OPTIONS = {
  type: [Boolean, String] as PropType<boolean | BoundableRequiredConstraints>,
  default: false,
} as const;

export function createBoundableInputProps<
  T extends BoundableValue = BoundableValue,
  D extends T | null = null,
  DS extends T | null = null,
  DE extends T | null = null,
  Min extends T | null = null,
  Max extends T | null = null,
>(options: BoundableInputControlPropsOptions<T, D, DS, DE, Min, Max>) {
  const {
    type,
    defaultValue = null as D,
    defaultStartValue = null as DS,
    defaultEndValue = null as DE,
    defaultMin = null as Min,
    defaultMax = null as Max,
    range,
  } = options;

  return {
    ...createFormNodeProps({
      ...options,
      required: REQUIRED_PROP_OPTIONS,
    }),
    ...createPropsOptions({
      modelValue: {
        type,
        default: defaultValue,
      } as {
        type: PropType<T | D>;
        default: null;
      },
      /**
       * Required condition
       *
       * @default false
       *
       * @see {@link BoundableRequiredConstraints}
       */
      required: undefined as unknown as typeof REQUIRED_PROP_OPTIONS,
      startValue: {
        type,
        default: defaultStartValue,
      } as {
        type: PropType<T | DS>;
        default: null;
      },
      endValue: {
        type,
        default: defaultEndValue,
      } as {
        type: PropType<T | DE>;
        default: null;
      },
      min: {
        type,
        default: defaultMin,
      } as {
        type: PropType<T | Min>;
        default: null;
      },
      max: {
        type,
        default: defaultMax,
      } as {
        type: PropType<T | Max>;
        default: null;
      },
      startName: String,
      endName: String,
      range: {
        type: Boolean,
        default: range,
      },
    }),
  };
}

export function createBoundableInputEmits<
  T extends BoundableValue = BoundableValue,
  D extends T | null = null,
  DS extends T | null = null,
  DE extends T | null = null,
  Min extends T | null = null,
  Max extends T | null = null,
>(_options: BoundableInputControlPropsOptions<T, D, DS, DE, Min, Max>) {
  return {
    ...createFormNodeEmits<T, D>(),
    'update:startValue': (value: T | DS) => true,
    'update:endValue': (value: T | DE) => true,
  };
}

export function createBoundableInputSettings<
  T extends BoundableValue = BoundableValue,
  D extends T | null = null,
  DS extends T | null = null,
  DE extends T | null = null,
  Min extends T | null = null,
  Max extends T | null = null,
>(options: BoundableInputControlPropsOptions<T, D, DS, DE, Min, Max>) {
  const props = createBoundableInputProps(options);
  const emits = createBoundableInputEmits(options);
  return { props, emits };
}

interface ResolvedProps<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
  Min extends T | null = null,
  Max extends T | null = null,
> {
  readonly modelValue: MV;
  readonly required: BoundableRequiredConstraintsSpec;
  readonly startValue: SV;
  readonly endValue: EV;
  readonly min: Min;
  readonly max: Max;
  readonly startName?: string;
  readonly endName?: string;
  readonly range: boolean;
}

export type BoundableInputProps<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
  Min extends T | null = null,
  Max extends T | null = null,
> = ExtractPropTypes<
  Omit<ReturnType<typeof createFormNodeProps>, 'modelValue' | 'required'>
> &
  ResolvedProps<T, MV, SV, EV, Min, Max>;

interface ResolvedEmits<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
> {
  'update:modelValue': (value: MV) => boolean;
  'update:startValue': (value: SV) => boolean;
  'update:endValue': (value: EV) => boolean;
  change: (value: MV) => boolean;
}

export type BoundableInputEmits<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
> = Omit<
  ReturnType<typeof createFormNodeEmits>,
  'update:modelValue' | 'change'
> &
  ResolvedEmits<T, MV, SV, EV>;

export type BoundableInputContext<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
> = SetupContext<BoundableInputEmits<T, MV, SV, EV>>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BoundableInputControlOptions<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
  Min extends T | null = null,
  Max extends T | null = null,
> extends Omit<
      BoundableInputControlPropsOptions<T, MV, SV, EV, Min, Max>,
      'type'
    >,
    Pick<FormNodeControlBaseOptions, 'nodeType'> {}

export class BoundableInputControl<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
  Min extends T | null = null,
  Max extends T | null = null,
> extends FormNodeControl<MV, MV, typeof REQUIRED_PROP_OPTIONS> {
  readonly _props: BoundableInputProps<T, MV, SV, EV, Min, Max>;
  protected _boundableOptions: BoundableInputControlOptions<
    T,
    MV,
    SV,
    EV,
    Min,
    Max
  >;

  protected _startValue: Ref<SV>;
  protected _endValue: Ref<EV>;
  protected _initialStartValue: Ref<SV>;
  protected _initialEndValue: Ref<EV>;
  protected _currentStartValue: WritableComputedRef<SV>;
  protected _currentEndValue: WritableComputedRef<EV>;
  protected _startName: ComputedRef<string | undefined>;
  protected _endName: ComputedRef<string | undefined>;
  protected _isRange: Ref<boolean>;
  protected _min: Ref<Min>;
  protected _max: Ref<Max>;

  get isRange() {
    return this._isRange.value;
  }

  get startName() {
    return this._startName.value;
  }

  get endName() {
    return this._endName.value;
  }

  get startValue() {
    return this._currentStartValue.value;
  }

  set startValue(startValue) {
    this._currentStartValue.value = startValue;
  }

  get endValue() {
    return this._currentEndValue.value;
  }

  set endValue(endValue) {
    this._currentEndValue.value = endValue;
  }
  get validationValue() {
    if (!this.isMounted) {
      return super.validationValue;
    }

    if (this._validationValueGetter) {
      return this._validationValueGetter();
    }
    if (this.isRange) {
      const values: T[] = [];
      const { startValue, endValue } = this;
      startValue && values.push(startValue);
      endValue && values.push(endValue);
      return values;
    }
    return this.value;
  }
  get initialStartValue() {
    return this._initialStartValue.value;
  }

  get initialEndValue() {
    return this._initialEndValue.value;
  }

  get min() {
    return this._min.value;
  }

  get max() {
    return this._max.value;
  }

  constructor(
    props: BoundableInputProps<T, MV, SV, EV, Min, Max>,
    ctx: BoundableInputContext<T, MV, SV, EV>,
    options: BoundableInputControlOptions<T, MV, SV, EV, Min, Max>,
  ) {
    super(props, ctx, {
      ...options,
      requiredFactory: () => {
        const { required } = props;
        if (!required) return undefined;
        boundableRequired(required === true ? 'any' : required);
      },
    });

    this._props = props;
    this._boundableOptions = options;
    this._isRange = ref(props.range);
    this._startName = computed(() => props.startName);
    this._endName = computed(() => props.endName);
    this._startValue = ref(props.startValue) as Ref<SV>;
    this._endValue = ref(props.endValue) as Ref<EV>;
    this._initialStartValue = ref(props.startValue) as Ref<SV>;
    this._initialEndValue = ref(props.endValue) as Ref<EV>;
    this._min = ref(props.min) as Ref<Min>;
    this._max = ref(props.max) as Ref<Max>;

    this._currentStartValue = computed({
      get: () => this._startValue.value,
      set: (value) => {
        if (this._startValue.value === value) return;
        this._startValue.value = value;
        ctx.emit('update:startValue', value);
      },
    });

    this._currentEndValue = computed({
      get: () => this._endValue.value,
      set: (value) => {
        if (this._endValue.value === value) return;
        this._endValue.value = value;
        ctx.emit('update:endValue', value);
      },
    });

    watch(
      () => props.startValue,
      (value) => {
        this._startValue.value = value;
      },
    );

    watch(
      () => props.endValue,
      (value) => {
        this._endValue.value = value;
      },
    );

    watch(
      () => props.min,
      (min) => {
        this._min.value = min;
      },
    );

    watch(
      () => props.max,
      (max) => {
        this._max.value = max;
      },
    );
  }

  protected hasRequiredRule() {
    return this.findRule(boundableRequired.$name);
  }

  commitSelfValue() {
    super.commitSelfValue();
    this._initialStartValue.value = this.startValue;
    this._initialEndValue.value = this.endValue;
  }

  resetSelfValue() {
    super.resetSelfValue();
    this.startValue = this._initialStartValue.value;
    this.endValue = this._initialEndValue.value;
  }

  emptyStartValue() {
    return (this._boundableOptions.defaultStartValue || null) as SV;
  }

  emptyEndValue() {
    return (this._boundableOptions.defaultStartValue || null) as EV;
  }

  clearSelf() {
    super.clearSelf();
    this.startValue = this.emptyStartValue();
    this.endValue = this.emptyEndValue();
  }

  protected _resolveRules() {
    if (!this.isMounted) return [];
    const rules = super._resolveRules();
    const { min, max } = this;
    min && rules.push(boundableMin(min));
    max && rules.push(boundableMax(max));

    rules.sort((a, b) => {
      const { $name: an } = a;
      const { $name: bn } = b;
      if (an === boundableRequired.$name) return -1;
      if (bn === boundableRequired.$name) return 1;
      return 0;
    });

    return rules;
  }
}

export function useBoundableInputControl<
  T extends BoundableValue = BoundableValue,
  MV extends T | null = T | null,
  SV extends T | null = T | null,
  EV extends T | null = T | null,
  Min extends T | null = null,
  Max extends T | null = null,
>(
  props: BoundableInputProps<T, MV, SV, EV, Min, Max>,
  ctx: BoundableInputContext<T, MV, SV, EV>,
  options: BoundableInputControlOptions<T, MV, SV, EV, Min, Max>,
) {
  const control = new BoundableInputControl<T, MV, SV, EV, Min, Max>(
    props,
    ctx,
    options,
  );
  return control;
}
