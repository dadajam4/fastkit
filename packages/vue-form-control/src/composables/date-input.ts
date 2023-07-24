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
  weekday: 'narrow',
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateInputControlPropsOptions<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> extends Omit<
    BoundableInputControlPropsOptions<DateInputValue, D, DS, DE, Min, Max>,
    'type'
  > {}

export type DateInputFormat =
  | Intl.DateTimeFormatOptions
  | ((value: DateInputValue) => string);

type FormatLocales = string | string[];

export function createDateInputProps<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(options?: DateInputControlPropsOptions<D, DS, DE, Min, Max>) {
  return {
    ...createBoundableInputProps({ type: String, ...options }),
    /**
     * {@link Intl.DateTimeFormatOptions}
     */
    format: Object as PropType<Intl.DateTimeFormatOptions>,
    /**
     * Format locales
     */
    formatLocales: [String, Array, Function] as PropType<
      FormatLocales | (() => FormatLocales)
    >,
  };
}

export function createDateInputEmits<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(options?: DateInputControlPropsOptions<D, DS, DE, Min, Max>) {
  return createBoundableInputEmits({
    type: String,
    ...options,
  });
}

export function createDateInputSettings<
  D extends DateInputValue | null = null,
  DS extends DateInputValue | null = null,
  DE extends DateInputValue | null = null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(options: DateInputControlPropsOptions<D, DS, DE, Min, Max>) {
  const props = createDateInputProps(options);
  const emits = createDateInputEmits(options);
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DateInputControlOptions<
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

export type DateInputProps<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> = BoundableInputProps<DateInputValue, MV, SV, EV, Min, Max> & {
  readonly format?: Intl.DateTimeFormatOptions;
  readonly formatLocales?: FormatLocales | (() => FormatLocales);
};

export type DateInputContext<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
> = BoundableInputContext<DateInputValue, MV, SV, EV>;

export class DateInputControl<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
> extends BoundableInputControl<DateInputValue, MV, SV, EV, Min, Max> {
  protected _formatLocales: ComputedRef<string | string[] | undefined>;
  protected _formatter: ComputedRef<Intl.DateTimeFormat>;
  protected _formattedValue: ComputedRef<string>;
  protected _formattedStartValue: ComputedRef<string>;
  protected _formattedEndValue: ComputedRef<string>;
  protected _isAnySelected: ComputedRef<boolean>;

  get formatLocales() {
    return this._formatLocales.value;
  }

  get formatter() {
    return this._formatter.value;
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

  constructor(
    props: DateInputProps<MV, SV, EV, Min, Max>,
    ctx: DateInputContext<MV, SV, EV>,
    options: DateInputControlOptions<MV, SV, EV, Min, Max>,
  ) {
    super(props, ctx, options);

    this._formatLocales = computed(() => {
      const locales = props.formatLocales || options.formatLocales;
      return typeof locales === 'function' ? locales() : locales;
    });
    this._formatter = computed(() => {
      const _options = props.format || options.format || DEFAULT_FORMAT;
      return new Intl.DateTimeFormat(this.formatLocales, _options);
    });
    this._formattedValue = computed(() => {
      const { value } = this;
      return value ? this.formatValue(value) : '';
    });
    this._formattedStartValue = computed(() => {
      const { startValue } = this;
      return startValue ? this.formatValue(startValue) : '';
    });
    this._formattedEndValue = computed(() => {
      const { endValue } = this;
      return endValue ? this.formatValue(endValue) : '';
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
}

export function useDateInputControl<
  MV extends DateInputValue | null = DateInputValue | null,
  SV extends DateInputValue | null = DateInputValue | null,
  EV extends DateInputValue | null = DateInputValue | null,
  Min extends DateInputValue | null = null,
  Max extends DateInputValue | null = null,
>(
  props: DateInputProps<MV, SV, EV, Min, Max>,
  ctx: DateInputContext<MV, SV, EV>,
  options: DateInputControlOptions<MV, SV, EV, Min, Max>,
) {
  const control = new DateInputControl<MV, SV, EV, Min, Max>(
    props,
    ctx,
    options,
  );
  return control;
}
