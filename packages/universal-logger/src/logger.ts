import {
  LogLevel,
  Transformer,
  Transport,
  createPayload,
  NormalizedLoggerOptions,
  MergedNamedSettings,
  LoggerBuilderOptions,
  transformPayload,
  normalizeTransports,
  LoggerPayload,
  LogLevelThreshold,
  levelToIndex,
  isAvailableLogLevel,
  DEFAULT_LOGGER_NAME,
} from './schemes';

import { isPromise } from '@fastkit/helpers';

/**
 * Logger
 */
export class Logger {
  /** Logger Name */
  readonly name: string;
  /**
   * List of log transform functions
   *
   * @see Transformer
   */
  readonly transformers: Transformer[];
  /**
   * List of Log transporter
   *
   * @see Transport
   */
  readonly transports: Transport[];

  /**
   * Log level thresholds that determine log output
   *
   * @see LogLevelThreshold
   */
  level: LogLevelThreshold;

  constructor(name: string, opts: NormalizedLoggerOptions) {
    this.name = name;
    this.transformers = opts.transformers;
    this.transports = opts.transports;
    this.level = opts.level || 'trace';
  }

  /**
   * Output logs at a specified log level
   *
   * @param level - Log level
   * @param args - List of log arguments
   * @returns Promise instance of log output result
   */
  log(level: LogLevel, ...args: any[]): Promise<any[]> {
    let payload = createPayload(this.name, level, ...args);
    const logLevelIndex = levelToIndex(payload.level);

    try {
      payload = transformPayload(payload, this.transformers);
    } catch (err) {
      return Promise.reject(err);
    }

    const results = this.transports.map(
      ({ level, transformers, transport }) => {
        if (level == null) level = this.level;
        if (!isAvailableLogLevel(logLevelIndex, level))
          return Promise.resolve();

        try {
          payload = transformPayload(payload, transformers);
          const result = transport(payload);
          return isPromise(result) ? result : Promise.resolve(result);
        } catch (err) {
          return Promise.reject(err);
        }
      },
    );

    return Promise.all(results);
  }

  /**
   * Output logs at the `trace` level
   * @param args - List of log arguments
   * @returns Promise instance of log output result
   */
  trace(...args: any[]) {
    return this.log('trace', ...args);
  }

  /**
   * Output logs at the `debug` level
   * @param args - List of log arguments
   * @returns Promise instance of log output result
   */
  debug(...args: any[]) {
    return this.log('debug', ...args);
  }

  /**
   * Output logs at the `info` level
   * @param args - List of log arguments
   * @returns Promise instance of log output result
   */
  info(...args: any[]) {
    return this.log('info', ...args);
  }

  /**
   * Output logs at the `warn` level
   * @param args - List of log arguments
   * @returns Promise instance of log output result
   */
  warn(...args: any[]) {
    return this.log('warn', ...args);
  }

  /**
   * Output logs at the `error` level
   * @param args - List of log arguments
   * @returns Promise instance of log output result
   */
  error(...args: any[]) {
    return this.log('error', ...args);
  }
}

/**
 * Combine multiple Transformers to generate a single log formatter function
 * @param transformers - List of log transform functions
 * @returns Combined log transform functions
 */
export function combineFormatter(...transformers: Transformer[]): Transformer {
  if (transformers.length === 1) return transformers[0];
  return function combinedFormatter(payload: LoggerPayload) {
    transformers.forEach((transformer) => {
      payload = transformer(payload);
    });
    return payload;
  };
}

/**
 * Logger generation results
 */
export interface LoggerBuilderResult {
  /**
   * Retrieve loggers with specified name
   *
   * - If no name is specified, the `default` logger name default will be set
   * - Once a logger instance is created, it is cached and will be reused the next time a logger acquisition request with the same name is made.
   *
   * @param name - Logger Name
   * @returns Logger instance
   */
  getLogger: (name?: string) => Logger;
  /**
   * Retrieves logger options corresponding to the specified logger name
   * @param name - Logger Name
   * @returns Logger options
   */
  getNamedSettings: (name: string) => NormalizedLoggerOptions;
  /**
   * Constructor of the generated logger class
   *
   * * Normally it is not necessary to instantiate a logger from this constructor. To retrieve the logger, use the getLogger() method.
   */
  Logger: typeof Logger;
}

/**
 * Generate loggers corresponding to the specified options
 *
 * @param opts - Logger builder options
 * @returns Logger generation results
 */
export function loggerBuilder(
  opts: LoggerBuilderOptions = {},
): LoggerBuilderResult {
  const { defaultSettings = {}, namedSettings = {} } = opts;
  const mergedNamedSettings = {} as MergedNamedSettings;
  const caches: {
    [key: string]: Logger;
  } = {};

  const {
    level: defaultLevelThreshold = 'trace',
    transformers: defaultTransformers = [],
  } = defaultSettings;

  const defaultTransports = normalizeTransports(defaultSettings.transports);

  Object.keys(namedSettings).forEach((name) => {
    const {
      level = defaultLevelThreshold,
      transformers = [],
      transports = [],
    } = namedSettings[name];
    const merged: NormalizedLoggerOptions = {
      level,
      transformers: [...defaultTransformers, ...transformers],
      transports: [...defaultTransports, ...normalizeTransports(transports)],
    };
    mergedNamedSettings[name] = merged;
  });

  function getNamedSettings(name: string): NormalizedLoggerOptions {
    const settings = mergedNamedSettings[name];
    return (
      settings || {
        level: defaultLevelThreshold,
        transformers: defaultTransformers,
        transports: defaultTransports,
      }
    );
  }

  class BuildedLogger extends Logger {
    constructor(name: string) {
      super(name, getNamedSettings(name));
    }
  }

  function getLogger(name: string = DEFAULT_LOGGER_NAME): BuildedLogger {
    const cache = caches[name];
    if (cache) return cache as BuildedLogger;
    const logger = new BuildedLogger(name);
    caches[name] = logger;
    return logger;
  }

  return { getLogger, getNamedSettings, Logger: BuildedLogger };
}
