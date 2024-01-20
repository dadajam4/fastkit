import { ExtractPropTypes, SetupContext, ComputedRef, computed } from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { toInt, toNumber } from '@fastkit/helpers';
import { notLessThan, notGreaterThan, multipleOf } from '@fastkit/rules';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';

const minValue = notLessThan.fork({ name: 'min' });
const maxValue = notGreaterThan.fork({ name: 'max' });
const stepValue = multipleOf.fork({ name: 'step' });

export function createNumberInputNodeProps() {
  return {
    ...createFormNodeProps({
      modelValue: Number,
    }),
    ...createPropsOptions({
      value: String,
      /** minimum value */
      min: [String, Number],
      /** greatest value */
      max: [String, Number],
      /** Input Value Steps */
      step: {
        type: [String, Number],
        default: 1,
      },
      /** placeholder */
      placeholder: String,
    }),
  };
}
export type NumberInputNodeProps = ExtractPropTypes<
  ReturnType<typeof createNumberInputNodeProps>
>;

export function createNumberInputNodeEmits() {
  return {
    ...createFormNodeEmits({ modelValue: Number }),
  };
}

export function createNumberInputNodeSettings() {
  const props = createNumberInputNodeProps();
  const emits = createNumberInputNodeEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NumberInputNodeEmitOptions
  extends ReturnType<typeof createNumberInputNodeEmits> {}

export type NumberInputNodeContext = SetupContext<NumberInputNodeEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NumberInputNodeControlOptions
  extends FormNodeControlBaseOptions {}

export class NumberInputNodeControl extends FormNodeControl<number, undefined> {
  readonly _props: NumberInputNodeProps;

  protected _min: ComputedRef<number | undefined>;

  protected _max: ComputedRef<number | undefined>;

  protected _step: ComputedRef<number>;

  get min() {
    return this._min.value;
  }

  get max() {
    return this._max.value;
  }

  get step() {
    return this._step.value;
  }

  get placeholder() {
    return this._props.placeholder;
  }

  constructor(
    props: NumberInputNodeProps,
    ctx: NumberInputNodeContext,
    options: NumberInputNodeControlOptions = {},
  ) {
    super(props, ctx as unknown as FormNodeContext<number, undefined>, {
      ...options,
      modelValue: Number,
    });
    this._props = props;

    this._min = computed(() => {
      const { min } = props;
      return min == null ? undefined : toInt(min);
    });

    this._max = computed(() => {
      const { max } = props;
      return max == null ? undefined : toInt(max);
    });

    this._step = computed(() => toNumber(props.step));
  }

  emptyValue() {
    return undefined;
  }

  protected _resolveRules() {
    const rules = super._resolveRules();
    const { min, max, step } = this;
    if (min != null) {
      rules.push(minValue(min));
    }
    if (max != null) {
      rules.push(maxValue(max));
    }
    rules.push(stepValue(step));
    return rules;
  }
}

export function useNumberInputNodeControl(
  props: NumberInputNodeProps,
  ctx: NumberInputNodeContext,
  options?: NumberInputNodeControlOptions,
) {
  const control = new NumberInputNodeControl(props, ctx, options);
  return control;
}
