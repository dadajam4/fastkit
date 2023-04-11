type RawDate = number | string | Date;

/**
 * Sources that generate durations.
 *
 * - `number` - milliseconds
 * - `[RawDate, RawDate]` - range
 * - `Duration` - Duration object.
 */
export type DurationSource = number | [RawDate, RawDate] | Duration;

/**
 * Milliseconds value for 1 second.
 */
export const ONE_SECOND_MS = 1000 as const;

/**
 * Milliseconds value for 1 minute.
 */
export const ONE_MINUTE_MS = 60000 as const;

/**
 * Milliseconds value for 1 hour.
 */
export const ONE_HOUR_MS = 3600000 as const;

/**
 * Milliseconds value for 1 day.
 */
export const ONE_DAY_MS = 86400000 as const;

/**
 * Helper class that calculates the duration for a given condition.
 */
export class Duration {
  /**
   * Creates a Duration instance for a given number of milliseconds.
   *
   * @param milliseconds - number of milliseconds
   */
  static milliseconds(milliseconds: number) {
    return new Duration(milliseconds);
  }

  /**
   * Creates a Duration instance for a given number of seconds.
   *
   * @param seconds - number of seconds
   */
  static seconds(seconds: number) {
    return new Duration(seconds * ONE_SECOND_MS);
  }

  /**
   * Creates a Duration instance for a given number of minutes.
   *
   * @param minutes - number of minutes
   */
  static minutes(minutes: number) {
    return new Duration(minutes * ONE_MINUTE_MS);
  }

  /**
   * Creates a Duration instance for a given number of hours.
   *
   * @param hours - number of hours
   */
  static hours(hours: number) {
    return new Duration(hours * ONE_HOUR_MS);
  }

  /**
   * Creates a Duration instance for a given number of days.
   *
   * @param days - number of days
   */
  static days(days: number) {
    return new Duration(days * ONE_DAY_MS);
  }

  private _milliseconds: number;

  get milliseconds() {
    return this._milliseconds;
  }

  get seconds() {
    return this.milliseconds / ONE_SECOND_MS;
  }

  get minutes() {
    return this.milliseconds / ONE_MINUTE_MS;
  }

  get hours() {
    return this.minutes / ONE_HOUR_MS;
  }

  get days() {
    return this.minutes / ONE_DAY_MS;
  }

  /**
   * Creates a Duration instance for a given number of milliseconds.
   *
   * @param milliseconds - number of milliseconds
   */
  constructor(milliseconds: number);

  /**
   * Creates a Duration instance for a given Date and time range.
   *
   * @param range - Date and time range
   */
  constructor(range: [RawDate, RawDate]);

  /**
   * Creates a cloned instance of a duration for a given instance of the original duration.
   *
   * @param duration - Original Duration instance
   */
  constructor(duration: Duration);

  /**
   * Creates a Duration instance for a given sources.
   *
   * @param source - Sources that generate durations.
   */
  constructor(source: DurationSource);

  /**
   * Creates a Duration instance for a given sources.
   *
   * @param source - Sources that generate durations.
   */
  constructor(source: DurationSource) {
    let milliseconds: number;

    if (typeof source === 'number') {
      milliseconds = source;
    } else if (Array.isArray(source)) {
      const [a, b] = source;
      const at = new Date(a).getTime();
      const bt = new Date(b).getTime();
      milliseconds = Math.abs(bt - at);
    } else {
      milliseconds = source.milliseconds;
    }

    this._milliseconds = milliseconds;
  }

  valueOf() {
    return this.milliseconds;
  }

  toJSON() {
    return this.milliseconds;
  }

  toString(): `${number}ms` {
    return `${this.milliseconds}ms`;
  }
}
