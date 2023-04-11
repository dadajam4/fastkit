/**
 * Type of value that can be a source value to create a Date instance.
 */
export type DateSource = number | string | Date;

/**
 * Date, or get epoch milliseconds from its source value
 * @param source - {@link DateSource Date source}
 * @returns epoch millisecond
 */
export function safeGetTimeByDateSource(source: DateSource) {
  if (typeof source === 'number') return source;
  if (typeof source === 'string') {
    source = new Date(source);
  }
  return source.getTime();
}

/**
 * Date, or normalize its source value to Date
 * @param source - {@link DateSource Date source}
 * @returns Date Instance
 */
export function toDate(source: number | string | Date): Date {
  return source instanceof Date ? source : new Date(source);
}

/**
 * List of date input precision
 */
export const DATE_INPUT_PRECISIONS = [
  'month',
  'date',
  'datetime-local',
] as const;

/**
 * Date input precision
 * @see {@link DATE_INPUT_PRECISIONS}
 */
export type DateInputPrecision = (typeof DATE_INPUT_PRECISIONS)[number];

export const DATE_INPUT_PARSE_RE =
  /^(\d{4})-(\d{2})(-(\d{2})(T(\d{2}):(\d{2}))?)?$/;

/**
 * Date input parse results
 */
export type ParseDateInputResult =
  | {
      precision: 'datetime-local';
      year: string;
      month: string;
      date: string;
      hours: string;
      minutes: string;
      source: string;
    }
  | {
      precision: 'date';
      year: string;
      month: string;
      date: string;
      hours?: undefined;
      minutes?: undefined;
      source: string;
    }
  | {
      precision: 'month';
      year: string;
      month: string;
      date?: undefined;
      hours?: undefined;
      minutes?: undefined;
      source: string;
    };

export function parseDateInput(source: string): ParseDateInputResult | null {
  let result: ParseDateInputResult | null = null;
  const matched = source.match(DATE_INPUT_PARSE_RE);
  if (matched) {
    const year = matched[1];
    const month = matched[2];
    const date = matched[4];
    const hours = matched[6];
    const minutes = matched[7];
    if (hours && minutes) {
      result = {
        precision: 'datetime-local',
        year,
        month,
        date,
        hours,
        minutes,
        source,
      };
    } else if (date) {
      result = {
        precision: 'date',
        year,
        month,
        date,
        source,
      };
    } else if (year && month) {
      result = {
        precision: 'month',
        year,
        month,
        source,
      };
    }
  }
  return result;
}
