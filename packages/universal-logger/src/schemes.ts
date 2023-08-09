import { ConsoleColorPaletteName } from '@fastkit/tiny-logger';

/**
 * List of available log levels
 */
export const LOG_LEVELS = ['error', 'warn', 'info', 'trace', 'debug'] as const;

/**
 * Available log level
 */
export type LogLevel = (typeof LOG_LEVELS)[number];

/** Threshold to cancel log output */
const SILENT_THRESHOLD = 'silent';

/**
 * Log level thresholds that determine log output
 *
 * * If `silent` is specified, no log is output
 */
export type LogLevelThreshold = typeof SILENT_THRESHOLD | LogLevel;

/**
 * Default threshold for log output if not set
 */
export const DEFAULT_LOG_LEVEL_THRESHOLD = 'trace';

/**
 * Obtains the index (order) for a given log level
 * @param level - Log level
 * @returns index (order)
 */
export function levelToIndex(level: LogLevel): number {
  return LOG_LEVELS.indexOf(level);
}

/**
 * Verify that the specified log level and log level index are valid for the specified thresholds
 * @param level - Log level or log level index
 * @param threshold - Log level threshold or index of log level to be thresholded
 * @returns `true` if valid
 */
export function isAvailableLogLevel(
  level: LogLevel | number,
  threshold?: LogLevelThreshold | number,
): boolean {
  if (threshold == null) return true;
  if (threshold === SILENT_THRESHOLD) return false;
  const levelIndex =
    typeof level === 'number' ? level : levelToIndex(level as LogLevel);
  const _threshold =
    typeof threshold === 'number' ? threshold : levelToIndex(threshold);

  return levelIndex <= _threshold;
}

interface Meta {
  [key: string]: any;
}

/**
 * Logger payload
 *
 * This payload is passed on to the transformer or transport method in turn
 */
export interface LoggerPayload<M extends Meta = Meta> {
  /**
   * Log level
   *
   * @see LogLevel
   */
  level: LogLevel;
  /** Logger Information */
  logger: {
    /** Logger Name */
    name: string;
  };
  /** Message */
  message: string;
  /** List of arguments passed to the logger */
  args: any[];
  /** Logger Meta Information */
  meta: M;
}

/**
 * Log transform function
 *
 * Function to convert the passed payload.
 */
export type Transformer = (payload: LoggerPayload) => LoggerPayload;

/**
 * Log output function
 *
 * Function to output and send the passed payload to standard output, external logging services, etc.
 */
export type TransportFunc = (payload: LoggerPayload) => any | Promise<any>;

/**
 * Log transporter
 */
export interface Transport {
  /**
   * Log level thresholds that determine log output
   *
   * * If not set, the threshold set in the logger will be selected
   */
  level?: LogLevelThreshold;
  /**
   * List of transform functions
   *
   * @see Transformer
   */
  transformers?: Transformer[];
  /**
   * Log output function
   *
   * @see TransportFunc
   */
  transport: TransportFunc;
}

/**
 * Log transport specification
 */
export type RawTransport = TransportFunc | Transport;

/**
 * Normalize log transport specification to log transporter
 * @param source - Log transport specification
 * @returns Log transporter
 */
export function normalizeTransport(source: RawTransport): Transport {
  return typeof source === 'function' ? { transport: source } : source;
}

/**
 * Normalize the list of log transport specifications to the list of log transporters
 * @param source - List of log transport specifications
 * @returns List of log transporters
 */
export function normalizeTransports(source?: RawTransport[]): Transport[] {
  return source ? source.map((r) => normalizeTransport(r)) : [];
}

/**
 * Logger Options
 */
export interface LoggerOptions {
  /**
   * Log level thresholds that determine log output
   *
   * @default "trace"
   *
   * @see LogLevelThreshold
   */
  level?: LogLevelThreshold;
  /**
   * List of transform functions
   *
   * @see Transformer
   */
  transformers?: Transformer[];
  /**
   * List of log output function
   *
   * @see RawTransport
   */
  transports?: RawTransport[];
}

/**
 * Normalized logger options
 */
export interface NormalizedLoggerOptions extends Pick<LoggerOptions, 'level'> {
  /**
   * List of transform functions
   *
   * @see Transformer
   */
  transformers: Transformer[];
  /**
   * List of log output function
   *
   * @see Transport
   */
  transports: Transport[];
}

/**
 * Map of logger options by name
 */
export interface LoggerNamedSettings {
  /**
   * Logger Options
   *
   * @see LoggerOptions
   */
  [key: string]: LoggerOptions;
}

/**
 * Map of normalized logger options by name
 */
export interface MergedNamedSettings {
  /**
   * Normalized logger Options
   *
   * @see NormalizedLoggerOptions
   */
  [key: string]: NormalizedLoggerOptions;
}

/**
 * Logger builder options
 */
export interface LoggerBuilderOptions {
  /**
   * Default logger options
   *
   * * Used as base option for all unnamed and named loggers
   */
  defaultSettings?: LoggerOptions;
  /**
   * Map of logger options by name
   *
   * @see LoggerNamedSettings
   */
  namedSettings?: LoggerNamedSettings;
}

/**
 * If the specified value is an object, attempt to extract log messages
 *
 * @param source - Variables that may contain messages
 * @returns If extracted, the message string
 */
function extractObjectMessage(source: any): string | undefined {
  if (
    source &&
    typeof source === 'object' &&
    typeof source.message === 'string'
  ) {
    return source.message;
  }
}

/**
 * Create logger payload
 *
 * @param loggerName - Logger Name
 * @param level - Log level
 * @param args - List of log arguments
 * @returns Logger payload
 */
export function createPayload(
  loggerName: string,
  level: LogLevel,
  ...args: any[]
): LoggerPayload {
  let message = '';
  const { length } = args;
  const first = args[0];

  if (typeof first === 'string') {
    // >>> log('hello', 2, true, {}) のような時は一個目がメッセージで良い
    message = first;
  } else {
    const firstMessage = extractObjectMessage(first);
    if (firstMessage !== undefined) {
      // >>> log({ message: 'hello' }, 2, true, {}) のような時は一個目がメッセージで良い
      message = firstMessage;
    } else if (length === 1 && Array.isArray(first)) {
      // >>> log([{ message: 'hello' }]) のような時は一個目がメッセージで良い
      message = extractObjectMessage(first[0]) || '';
    }
  }

  if (args[0] === message) {
    args.splice(0, 1);
  }

  const payload: LoggerPayload = {
    logger: {
      name: loggerName,
    },
    level,
    message,
    args,
    meta: {},
  };
  return payload;
}

/**
 * Process logger payloads with a specified list of transformers
 *
 * @param payload - Logger payload
 * @param transformers - List of log transform function
 * @returns Processed logger payload
 */
export function transformPayload(
  payload: LoggerPayload,
  transformers: Transformer[] | undefined,
): LoggerPayload {
  transformers &&
    transformers.forEach((transformer) => {
      payload = transformer(payload);
    });
  return payload;
}

/**
 * Map of colors by default log level
 */
export const DEFAULT_COLOR_LEVEL_MAP: Record<
  LogLevel,
  ConsoleColorPaletteName
> = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  trace: 'magenta',
  debug: 'magenta', // 'gray',
};

/**
 * Default logger name when logger name is not specified
 */
export const DEFAULT_LOGGER_NAME = 'default';
