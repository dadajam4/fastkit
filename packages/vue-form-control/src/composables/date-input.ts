import {
  BoundableInputControlPropsOptions,
  createBoundableInputProps,
  createBoundableInputEmits,
  BoundableInputControlOptions,
  BoundableInputProps,
  BoundableInputContext,
  BoundableInputControl,
} from './boundable-input';
import { PropType, ComputedRef, computed } from 'vue';

type DateInputValue = string;

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateInputNodeControlPropsOptions<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> extends Omit<
    BoundableInputControlPropsOptions<DateInputValue, D, DS, DE, Min, Max>,
    'type'
  > {
  omitEndYearFormat?: boolean;
}

export type DateInputFormat =
  | Intl.DateTimeFormatOptions
  | ((value: DateInputValue) => string);

type FormatLocales = string | string[];

export function createDateInputNodeProps<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(options: DateInputNodeControlPropsOptions<D, DS, DE, Min, Max> = {}) {
  const { omitEndYearFormat = true } = options;
  return {
    ...createBoundableInputProps({ type: String, ...options }),
    /**
     * {@link Intl.DateTimeFormatOptions}
     */
    format: Object as PropType<Intl.DateTimeFormatOptions>,
    /**
     * Omit the western calendar year of the end date.
     */
    omitEndYearFormat: {
      type: Boolean,
      default: omitEndYearFormat,
    },
    /**
     * Format locales
     */
    formatLocales: [String, Array, Function] as PropType<
      FormatLocales | (() => FormatLocales)
    >,
  };
}

export function createDateInputNodeEmits<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(options?: DateInputNodeControlPropsOptions<D, DS, DE, Min, Max>) {
  return createBoundableInputEmits({
    type: String,
    ...options,
  });
}

export function createDateInputNodeSettings<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(options: DateInputNodeControlPropsOptions<D, DS, DE, Min, Max>) {
  const props = createDateInputNodeProps(options);
  const emits = createDateInputNodeEmits(options);
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateInputNodeControlOptions<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> extends BoundableInputControlOptions<DateInputValue, MV, SV, EV, Min, Max> {
  /**
   * {@link Intl.DateTimeFormatOptions}
   */
  format?: Intl.DateTimeFormatOptions;
  /**
   * Format locales
   *
   * Used when {@link Intl.DateTimeFormatOptions} is specified in format prop.
   */
  formatLocales?: FormatLocales | (() => FormatLocales);
}

export type DateInputNodeProps<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> = BoundableInputProps<DateInputValue, MV, SV, EV, Min, Max> & {
  readonly format?: Intl.DateTimeFormatOptions;
  readonly omitEndYearFormat: boolean;
  readonly formatLocales?: FormatLocales | (() => FormatLocales);
};

export type DateInputNodeContext<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
> = BoundableInputContext<DateInputValue, MV, SV, EV>;

export class DateInputNodeControl<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> extends BoundableInputControl<DateInputValue, MV, SV, EV, Min, Max> {
  readonly _props: DateInputNodeProps<MV, SV, EV, Min, Max>;
  protected _formatLocales: ComputedRef<string | string[] | undefined>;
  protected _formatOptions: ComputedRef<Intl.DateTimeFormatOptions>;
  protected _omitYearFormatOptions: ComputedRef<Intl.DateTimeFormatOptions>;
  protected _formatter: ComputedRef<Intl.DateTimeFormat>;
  protected _omitYearFormatter: ComputedRef<Intl.DateTimeFormat>;
  protected _formattedValue: ComputedRef<string>;
  protected _formattedStartValue: ComputedRef<string>;
  protected _formattedEndValue: ComputedRef<string>;
  protected _isAnySelected: ComputedRef<boolean>;

  get formatLocales() {
    return this._formatLocales.value;
  }

  get formatOptions() {
    return this._formatOptions.value;
  }

  get omitYearFormatOptions() {
    return this._omitYearFormatOptions.value;
  }

  get formatter() {
    return this._formatter.value;
  }

  get omitYearFormatter() {
    return this._omitYearFormatter.value;
  }

  get formattedValue() {
    return this._formattedValue.value;
  }

  get formattedStartValue() {
    return this._formattedStartValue.value;
  }

  get formattedEndValue() {
    return this._formattedEndValue.value;
  }

  get isAnySelected() {
    return this._isAnySelected.value;
  }

  get omitEndYearFormat() {
    return this._props.omitEndYearFormat;
  }

  constructor(
    props: DateInputNodeProps<MV, SV, EV, Min, Max>,
    ctx: DateInputNodeContext<MV, SV, EV>,
    options: DateInputNodeControlOptions<MV, SV, EV, Min, Max>,
  ) {
    super(props, ctx, options);

    this._props = props;

    this._formatLocales = computed(() => {
      const locales = props.formatLocales || options.formatLocales;
      return typeof locales === 'function' ? locales() : locales;
    });

    this._formatOptions = computed(() => {
      return props.format || options.format || DEFAULT_FORMAT;
    });

    this._omitYearFormatOptions = computed(() => {
      const options: Intl.DateTimeFormatOptions = {
        ...this.formatOptions,
      };
      delete options.year;
      return options;
    });

    this._formatter = computed(
      () => new Intl.DateTimeFormat(this.formatLocales, this.formatOptions),
    );

    this._omitYearFormatter = computed(
      () =>
        new Intl.DateTimeFormat(this.formatLocales, this.omitYearFormatOptions),
    );

    this._formattedValue = computed(() => {
      const { value } = this;
      return value ? this.formatValue(value) : '';
    });

    this._formattedStartValue = computed(() => {
      const { startValue } = this;
      return startValue ? this.formatValue(startValue) : '';
    });

    this._formattedEndValue = computed(() => {
      const { startValue, endValue, omitEndYearFormat } = this;
      if (!endValue) return '';
      if (!startValue || !omitEndYearFormat) return this.formatValue(endValue);
      const startDt = startValue && new Date(startValue);
      const endDt = endValue && new Date(endValue);
      const isSameYear = startDt.getFullYear() === endDt.getFullYear();
      return isSameYear
        ? this.omitYearFormatValue(endDt)
        : this.formatValue(endDt);
    });

    this._isAnySelected = computed(() => {
      return this.isRange ? !!this.startValue && !!this.endValue : !!this.value;
    });
  }

  formatValue(value: DateInputValue | Date) {
    const dt = value instanceof Date ? value : new Date(value);
    return this.formatter.format(dt);
  }

  formatValueToParts(value: DateInputValue | Date) {
    const dt = value instanceof Date ? value : new Date(value);
    return this.formatter.formatToParts(dt);
  }

  omitYearFormatValue(value: DateInputValue | Date) {
    const dt = value instanceof Date ? value : new Date(value);
    return this.omitYearFormatter.format(dt);
  }

  omitYearFormatValueToParts(value: DateInputValue | Date) {
    const dt = value instanceof Date ? value : new Date(value);
    return this.omitYearFormatter.formatToParts(dt);
  }
}

export function useDateInputNodeControl<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(
  props: DateInputNodeProps<MV, SV, EV, Min, Max>,
  ctx: DateInputNodeContext<MV, SV, EV>,
  options: DateInputNodeControlOptions<MV, SV, EV, Min, Max>,
) {
  const control = new DateInputNodeControl<MV, SV, EV, Min, Max>(
    props,
    ctx,
    options,
  );
  return control;
}
