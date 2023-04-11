type AnyFunction = (...args: any[]) => any;

/**
 * Debounced instance
 *
 * This interface itself is a handler function in which the debounce process is injected.
 */
export interface Debounced<FN extends AnyFunction = AnyFunction> {
  /** Handler function with injected debounce process */
  (...args: Parameters<FN>): void;
  /** Clears the timer and cancels execution of waiting handlers */
  clear(): void;
  /**
   * Execute delay handlers that may be waiting
   *
   * @note
   * If there is no delayed processing waiting yet, this call will not execute anything.
   */
  flush(): void;
  /**
   * Updates the delay time already set
   * @param delay - New delay time
   */
  setDelay(delay: number): void;
}

/**
 * Debounce options
 */
export interface DebounceOptions {
  /**
   * Delay time (millisecond)
   *
   * @note
   * If set to `0`, the program is executed immediately without waiting for the delay time to be set.
   * Note that this is different from the {@link DebounceOptions.immediate immediate} option.
   * @default DEFAULT_DEBOUNCE_DELAY
   * @see {@link DEFAULT_DEBOUNCE_DELAY}
   */
  delay?: number;
  /** Immediately executes the handler */
  immediate?: boolean;
}

/**
 * Debounce settings
 */
export interface DebounceSettings<FN extends AnyFunction = AnyFunction>
  extends DebounceOptions {
  /** handler function */
  handler: FN;
}

export const DEFAULT_DEBOUNCE_DELAY = 166;

/**
 * Normalize debounce settings
 * @param fnOrSettings - Handler method or debounce setting
 * @param delayOrOptions - Delay time, or debounce option
 * @param immediateOption - immediate option
 * @returns Debounce settings
 */
export function resolveDebounceSettings<FN extends AnyFunction = AnyFunction>(
  fnOrSettings: FN | DebounceSettings<FN>,
  delayOrOptions?: number | DebounceOptions,
  immediateOption?: boolean,
): DebounceSettings<FN> {
  let settings: DebounceSettings<FN>;

  if (typeof fnOrSettings === 'function') {
    settings = {
      handler: fnOrSettings,
    };
  } else {
    settings = {
      ...fnOrSettings,
    };
  }

  if (typeof delayOrOptions === 'number') {
    settings.delay = delayOrOptions;
  } else if (typeof delayOrOptions === 'object') {
    Object.assign(settings, delayOrOptions);
  }

  if (typeof immediateOption === 'boolean') {
    settings.immediate = immediateOption;
  }
  return settings;
}

const MISSING_SYMBOL = Symbol();

function isMissingSymbol(source: unknown): source is typeof MISSING_SYMBOL {
  return source === MISSING_SYMBOL;
}

export function debounce<FN extends AnyFunction = AnyFunction>(handler: FN, delay?: number, immediate?: boolean): Debounced<FN>; // eslint-disable-line prettier/prettier
export function debounce<FN extends AnyFunction = AnyFunction>(handler: FN, options: DebounceOptions): Debounced<FN>; // eslint-disable-line prettier/prettier
export function debounce<FN extends AnyFunction = AnyFunction>(setrings: DebounceSettings<FN>): Debounced<FN>; // eslint-disable-line prettier/prettier

export function debounce<FN extends AnyFunction = AnyFunction>(
  fnOrSettings: FN | DebounceSettings<FN>,
  delayOrOptions?: number | DebounceOptions,
  immediateOption?: boolean,
): Debounced<FN> {
  const resolved = resolveDebounceSettings(
    fnOrSettings,
    delayOrOptions,
    immediateOption,
  );
  const { handler, immediate } = resolved;
  let { delay = DEFAULT_DEBOUNCE_DELAY } = resolved;

  let booted = false;
  let timerId: number | NodeJS.Timer | undefined;
  let lastArgs: Parameters<FN> | typeof MISSING_SYMBOL = MISSING_SYMBOL;

  const debounced: Debounced<FN> = function debounced(
    this: Debounced<FN>,
    ...args: Parameters<FN>
  ) {
    if (delay === 0) {
      handler.apply(handler, args);
      return;
    }
    lastArgs = args;
    clear();
    if (!booted) {
      if (immediate) {
        flush();
      }
      booted = true;
    }
    timerId = setTimeout(flush, delay);
  };

  function clear() {
    if (timerId) {
      clearTimeout(timerId as any);
      timerId = void 0;
    }
  }

  function flush() {
    if (!isMissingSymbol(lastArgs)) {
      handler.apply(handler, lastArgs);
    }
    clear();
  }

  debounced.clear = clear;
  debounced.flush = flush;
  debounced.setDelay = function setDelay(_delay) {
    delay = _delay;
    flush();
  };

  return debounced;
}
