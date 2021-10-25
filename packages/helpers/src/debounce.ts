export type Debouncable = (...args: any[]) => any;

export interface Debounced<FN extends Debouncable = Debouncable> {
  (...args: Parameters<FN>): void;
  clear(): void;
  flush(): void;
  setDelay(delay: number): void;
}

export interface DebounceOptions {
  delay?: number;
  immediate?: boolean;
}

export interface DebounceSettings<FN extends Debouncable = Debouncable>
  extends DebounceOptions {
  handler: FN;
}

export function resolveDebounceSettings<FN extends Debouncable = Debouncable>(
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

export function debounce<FN extends Debouncable = Debouncable>(handler: FN, delay?: number, immediate?: boolean): Debounced<FN>; // eslint-disable-line prettier/prettier
export function debounce<FN extends Debouncable = Debouncable>(handler: FN, options: DebounceOptions): Debounced<FN>; // eslint-disable-line prettier/prettier
export function debounce<FN extends Debouncable = Debouncable>(setrings: DebounceSettings<FN>): Debounced<FN>; // eslint-disable-line prettier/prettier

export function debounce<FN extends Debouncable = Debouncable>(
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
  let { delay = 166 } = resolved;

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
